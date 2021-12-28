# node-openjtalk-binding-discordjs
Glue code between node-openjtalk-binding and discordjs.

## Requirements
- Able to run [node-gyp](https://github.com/nodejs/node-gyp#installation)
- c++ 14 can be compiled. 
- If you use Mac OS, 10.14 or later is required because std::get cannot use before 10.14.

## Install
```sh
#npm
npm install node-openjtalk-binding-discordjs
#yarn
yarn add node-openjtalk-binding-discordjs
```

## Example
### v12
```js
const { synthesis, silenceOnError } = require("node-openjtalk-binding-discordjs");
const path  = require("path");

const htsvoice = readFileSync(path_to_htsvoice);

/* ... */

const stream = silenceOnError(synthesis(message.content, {
  htsvoice,
}),err => console.error("Stream Error:", err));

connection.play(stream, {
  type: "converted"
});
```
### v13
```js
const { synthesis, silenceOnError } = require("node-openjtalk-binding-discordjs");
const path  = require("path");

const htsvoice = readFileSync(path_to_htsvoice);

/* ... */

const stream = silenceOnError(synthesis(message.content, {
  htsvoice,
}),err => console.error("Stream Error:", err));

const resource = createAudioResource(stream, {
  inputType: StreamType.Raw,
});

player.play(resource);
```

## HTSVoice
[Google it!](https://www.google.com/search?q=htsvoice)