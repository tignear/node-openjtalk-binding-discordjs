import { synthesis } from "../../dist/index";
import { Client, Message, Intents } from "discord.js";
import * as path from "path";
import { readFileSync } from "fs";
import { AudioPlayer, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
const prefix = "!";
const htsvoice = readFileSync(path.resolve(__dirname, "../hts_voice_nitech_jp_atr503_m001-1.05/nitech_jp_atr503_m001.htsvoice"));
const client = new Client({
  intents: Intents.NON_PRIVILEGED
});
interface TTSContext {
  player: AudioPlayer,
  channels: Set<string>
}
const ttsEnabledChannel = new Map<string, TTSContext>();
async function startCommand(message: Message) {
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
  let connection: VoiceConnection;
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
async function endCommand(message: Message) {
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
async function onMessage(message: Message) {
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
function tts(message: Message) {
  const guild = message.guild;
  if (!guild) {
    return;
  }
  const context = ttsEnabledChannel.get(guild.id);
  if (context?.channels.has(message.channel.id)) {
    const stream = synthesis(message.content, {
      htsvoice,
    });
    const resource = createAudioResource(stream, {
      inputType: StreamType.Raw,
    });
    stream.on("error", err => console.error("Stream Error:", err));

    context.player.play(resource);
  }
}
client.on("message", message => {
  onMessage(message).catch(err => console.error(err));
  tts(message);
});
client.login(process.env.DISCORD_TOKEN);