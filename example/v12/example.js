const { synthesis, silenceOnError } = require("../../dist/index");
const { Client } = require("discord.js");
const fs = require("fs");
const path  = require("path");
const htsvoice = fs.readFileSync(path.resolve(__dirname, "../hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice"));
const prefix = "!";
const client = new Client();
const ttsEnabledChannel = new Map();
async function startCommand(message) {
  const target_vc = message.member?.voice.channel;
  const guild = message.guild;
  if (!guild) {
    return;
  }
  if (!target_vc) {
    await message.channel.send("Please join a voice channel first.");
    return;
  }
  if (!target_vc.joinable) {
    await message.channel.send(`I can't join VC: ${target_vc.name}`);
  }
  try {
    await target_vc.join();
    await message.channel.send(`TTS started in: ${target_vc.name}`);
  } catch (err) {
    await message.channel.send(`Failed to join voice channel: ${target_vc.name}`);
    console.error(err);
  }
  const enabledChannels = ttsEnabledChannel.get(guild.id);
  if (enabledChannels) {
    enabledChannels.add(message.channel.id);
  } else {
    ttsEnabledChannel.set(guild.id, new Set([message.channel.id]));
  }
}
async function endCommand(message) {
  const guild = message.guild;
  if (!guild) {
    return;
  }
  const target_vc = guild.me?.voice.channel;
  if (!target_vc) {
    return;
  }
  target_vc.leave();
  ttsEnabledChannel.delete(guild.id);
  await message.channel.send(`TTS end: ${target_vc.name}`);
}
async function onMessage(message) {
  const content = message.content;
  if (!content.startsWith(prefix)) {
    return;
  }
  const [command] = content.substring(prefix.length).split(" ");
  switch (command) {
    case "s":
    case "start":
      await startCommand(message);
      return;
    case "e":
    case "end":
      await endCommand(message);
      return;
    default:
      break;
  }
}
function tts(message) {
  const guild = message.guild;
  if (!guild) {
    return;
  }
  if (ttsEnabledChannel.get(guild.id)?.has(message.channel.id)) {
    const stream = silenceOnError(synthesis(message.content, {
      htsvoice,
    }),err => console.error("Stream Error:", err));

    guild.me?.voice.connection?.play(stream, {
      type: "converted"
    });
  }
}
client.on("message", message => {
  onMessage(message).catch(err => console.error(err));
  tts(message);
});
client.login(process.env.DISCORD_TOKEN);