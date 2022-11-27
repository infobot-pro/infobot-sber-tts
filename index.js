const {v4: uuidv4} = require('uuid');
const axios = require("axios");
const qs = require('querystring');
const https = require('https');
const fs = require('fs');

class InfobotSberTTS {
    constructor(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.token = null;

        this.httpsAgent = new https.Agent({
            ca: [
                fs.readFileSync(`${__dirname}/certs/russian_trusted_root_ca.cer`),
                fs.readFileSync(`${__dirname}/certs/russian_trusted_sub_ca.cer`)
            ], keepAlive: false
        });

        if (!this.clientId) throw new Error('No Service Client ID provided');
        if (!this.clientSecret) throw new Error('No Service Client Secret provided');
    }

    generateToken() {
        const self = this;
        return new Promise(function (resolve, reject) {
            if (!(self.token && self.tokenExpire && self.tokenExpire < (new Date().getTime() - 10 * 1000))) {
                const payload = {
                    'scope': 'SBER_SPEECH'
                };
                const code = Buffer.from(`${self.clientId}:${self.clientSecret}`).toString('base64');
                axios({
                    method: 'post',
                    url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
                    headers: {
                        'RqUID': uuidv4(),
                        'Authorization': `Basic ${code}`,
                    },
                    data: qs.encode(payload),
                    httpsAgent: self.httpsAgent
                }).then(result => {
                    self.token = result.data.access_token;
                    self.tokenExpire = result.data.expires_at;
                    resolve(self.token);
                }).catch(e => {
                    reject(e);
                })
            } else {
                resolve(self.token);
            }
        });
    }

    generateAudio(text, params) {
        const self = this;
        return new Promise(function (resolve, reject) {
            if (!text) reject('No text specified');
            self.generateToken().then(function () {
                params.format = params.format || 'opus';
                params.voice = params.voice || 'Nec_24000';

                const data = {
                    voice: params.voice,
                    format: params.format,
                };
                axios({
                    method: 'post',
                    url: 'https://smartspeech.sber.ru/rest/v1/text:synthesize',
                    headers: {
                        'Authorization': 'Bearer ' + self.token,
                        'Content-Type': params.ssml ? 'application/ssml' : 'application/text'
                    },
                    params: data,
                    data: text,
                    responseType: 'arraybuffer',
                    httpsAgent: self.httpsAgent
                }).then(result => {
                    resolve(result.data);
                }).catch(e => {
                    reject(e);
                })
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}

module.exports = InfobotSberTTS;
