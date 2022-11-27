# infobot-sber-tts
Node.JS library for [Sber SmartSpeech](https://developers.sber.ru/portal/tools/smartspeech) service.
Library can synchronously synthesize speech from text.

To work with this library you need to obtain from Sber SmartSpeech:
* Client ID
* Client Secret

Please check [this page](https://developers.sber.ru/portal/tools/smartspeech) for information about credentials.

## Audio file synthesize example:
```javascript
var SberTTS = require('infobot-sber-tts');
var fs = require('fs');

var clientID = '*';
var clientSecret = '*';

var tts = new SberTTS(clientID, clientSecret);
tts.generateAudio('Привет, мир!', {
    format: 'opus',
    voice: 'Nec_24000'
}).then(res => {
    fs.writeFileSync('test.opus', res);
}).catch(err => console.log(err));
````

Provided by [INFOBOT LLC.](https://infobot.pro) under Apache 2.0 license.

