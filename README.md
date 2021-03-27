# node-openjtalk-binding-discordjs
Glue code between node-openjtalk-binding and discordjs.
## Install
```sh
#npm
npm install node-openjtalk-binding-discordjs
#yarn
yarn add node-openjtalk-binding-discordjs
```

## Example
```js
connection.play(synthesis(message.content, {
  htsvoice: path_to_htsvoice,
}), {
  type: "converted"
});
```