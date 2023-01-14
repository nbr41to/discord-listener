require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { WebClient } = require('@slack/web-api');
const { format } = require('date-fns');
const express = require('express');
const app = express();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_LEARNING_CHANNEL_ID = process.env.DISCORD_LEARNING_CHANNEL_ID;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_LEARNING_CHANNEL_ID = process.env.SLACK_LEARNING_CHANNEL_ID;
const PORT = process.env.PORT || 3001;

const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const slack = new WebClient(SLACK_BOT_TOKEN);

discord.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

/* ボイスチャンネルのイベントを検知 */
discord.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const oldChannel = oldState.channel;
  const newChannel = newState.channel;

  /* 人数が変化していない場合 */
  if (oldChannel === newChannel) return;

  /* 最初の一人を検知 */
  if (
    newChannel &&
    newChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
    newChannel.members.size === 1
  ) {
    try {
      const nowString = format(new Date(), 'yyyy/MM/dd HH:mm:ss');
      console.log('oldChannel', newChannel.name);
      console.log('start');
      await slack.chat.postMessage({
        channel: SLACK_LEARNING_CHANNEL_ID,
        text: `[${nowString}]\nDiscordの自習室で作業を開始したメンバーがいるようです！\n下のURLから参加してみましょう🥳\nhttps://discord.gg/JarxAYjm6C`,
        unfurl_links: false,
        unfurl_media: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  /* 最後の一人を検知 */
  if (
    oldChannel &&
    oldChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
    oldChannel.members.size === 0
  ) {
    console.log('oldChannel', oldChannel.name);
    console.log('end');
  }
});

discord.login(DISCORD_BOT_TOKEN);

/* renderのdeployに成功するため */
app.get('/health', function (req, res) {
  res.send('OK');
});
app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});
