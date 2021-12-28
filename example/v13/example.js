const { synthesis, silenceOnError } = require("../../dist/index");
const { Client, Intents } = require("discord.js");
const path = require("path");
const { readFileSync } = require("fs");
const { createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnectionStatus } = require("@discordjs/voice");
const prefix = "!";
const htsvoice = readFileSync(path.resolve(__dirname, "../hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice"));
const client = new Client({
  intents: Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_VOICE_STATES | Intents.FLAGS.GUILD_MESSAGES
});

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
    await message.channel.send(`I can't join VC: ${target_vc}`);
  }
  let connection;
  try {
    connection = joinVoiceChannel({
      guildId: guild.id,
      channelId: target_vc.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfMute: false,
    });
    await entersState(connection, VoiceConnectionStatus.Ready, 10 * 1000);
    await message.channel.send(`TTS started in: ${target_vc}`);
  } catch (err) {
    await message.channel.send(`Failed to join voice channel: ${target_vc}`);
    console.error(err);
    return;
  }
  const enabledChannels = ttsEnabledChannel.get(guild.id);
  if (enabledChannels) {
    enabledChannels.channels.add(message.channel.id);
  } else {
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      }
    });
    connection.subscribe(player);
    ttsEnabledChannel.set(guild.id, {
      player, channels: new Set([message.channel.id])
    });
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
  ttsEnabledChannel.delete(guild.id);
  const connection = getVoiceConnection(guild.id);
  if (!connection) {
    return;
  }
  connection.destroy();
  await message.channel.send(`TTS end: ${target_vc}`);
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
  const context = ttsEnabledChannel.get(guild.id);
  if (context?.channels.has(message.channel.id)) {
    const stream = silenceOnError(synthesis(message.content, {
      htsvoice,
    }), err => console.error("Stream Error:", err));
    const resource = createAudioResource(stream, {
      inputType: StreamType.Raw,
    });
    context.player.play(resource);
  }
}
client.on("messageCreate", message => {
  onMessage(message).catch(err => console.error(err));
  tts(message);
});
client.login(process.env.DISCORD_TOKEN);