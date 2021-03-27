# node-openjtalk-binding-discordjs
Glue code between node-openjtalk-binding and discordjs.

## Requirements
- Able to run [node-gyp](https://github.com/nodejs/node-gyp#installation)
- Able to run automake.
  - If you use Linux or Mac OS.
- c++ 17 can be compiled. 
- If you use Mac OS, 10.14 or later is required because std::get cannot use before 10.14.

## Install
```sh
#npm
npm install node-openjtalk-binding-discordjs
#yarn
yarn add node-openjtalk-binding-discordjs
```

## Example
```js
const { synthesis } = require("node-openjtalk-binding-discordjs");

/* ... */

const stream = synthesis(message.content, {
  htsvoice: path_to_htsvoice,
});
stream.on("error",err=>console.error(err));
connection.play(stream, {
  type: "converted"
});
```

## HTSVoice
[Google it!](https://www.google.com/search?q=htsvoice)