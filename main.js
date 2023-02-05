require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { WebClient } = require('@slack/web-api');
const dayjs = require('dayjs');
const {
  startedBlocks,
  updatedBlocks,
  finishedBlocks,
} = require('./src/slackSendBlock.js');
const {
  getLatestSession,
  createSession,
  updateSession,
  deleteSession,
} = require('./src/sessions.js');
const express = require('express');

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.tz.setDefault('Asia/Tokyo');

/* Environments */
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_LEARNING_CHANNEL_ID = process.env.DISCORD_LEARNING_CHANNEL_ID;
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_LEARNING_CHANNEL_ID = process.env.SLACK_LEARNING_CHANNEL_ID;

const discord = new Client({
  /* ユーザのアドレスを取りたい */
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

  const isStarting =
    newChannel &&
    newChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
    newChannel.members.size === 1;
  const isUpdating =
    (newChannel &&
      newChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
      newChannel.members.size > 1) ||
    (oldChannel &&
      oldChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
      oldChannel.members.size > 0);
  const isFinishing =
    oldChannel &&
    oldChannel.id === DISCORD_LEARNING_CHANNEL_ID &&
    oldChannel.members.size === 0;

  /* 人数が変化していない場合 */
  if (oldChannel === newChannel) return;

  /* 最初の一人を検知 */
  if (isStarting) {
    try {
      const nowJp = dayjs.tz().format('YYYY/MM/DD HH:mm:ss');

      /* Slackへの通知 */
      const response = await slack.chat.postMessage({
        channel: SLACK_LEARNING_CHANNEL_ID,
        blocks: startedBlocks(nowJp, newState.member.user.username),
        text: 'Started learning 🎉',
      });

      /* ルームの作成 */
      await createSession({
        slack_timestamp: response.ts,
        joined_member_ids: [newState.member.user.id],
      });
    } catch (error) {
      console.error(error);
    }
  }

  /* 人の出入りを検知 */
  if (isUpdating) {
    try {
      /* 最新のSessionのtsを取得 */
      const session = await getLatestSession();
      if (!session) return;
      const ts = '1675558684994879';
      // const ts = session.slack_timestamp;
      const startedAtFormatted = dayjs
        .utc(session.created_at)
        .add(9, 'hour')
        .format('YYYY/MM/DD HH:mm:ss');
      const isJoining = newChannel?.id === DISCORD_LEARNING_CHANNEL_ID;
      const members = isJoining
        ? newChannel.members.map((member) => member.user.username)
        : oldChannel.members.map((member) => member.user.username);

      /* Slackの投稿を更新 */
      await slack.chat.update({
        channel: SLACK_LEARNING_CHANNEL_ID,
        ts,
        blocks: updatedBlocks(startedAtFormatted, members),
        text: 'updated learning 👥',
      });

      const joinedIds = isJoining
        ? newChannel.members.map((member) => member.user.id)
        : oldChannel.members.map((member) => member.user.id);
      /* ルームの作成 */
      await createSession({
        slack_timestamp: ts,
        joined_member_ids: joinedIds,
      });

      /* Sessionを更新 */
      // const joinedIds = newChannel.members.map((member) => member.user.id);
      // await updateSession(ts, { joined_member_ids: joinedIds });
    } catch (error) {
      console.error(error);
    }
  }

  /* 最後の一人を検知 */
  if (isFinishing) {
    /* 最新のSessionのtsを取得 */
    const session = await getLatestSession();
    if (!session) return;
    const ts = session.slack_timestamp;
    const startedAtUTC = dayjs.utc(session.created_at);
    const startedAtFormatted = startedAtUTC
      .add(9, 'hour')
      .format('YYYY/MM/DD HH:mm:ss');
    /* 開催時間 */
    const hour = dayjs.utc().diff(startedAtUTC, 'hour');
    const minute = dayjs.utc().diff(startedAtUTC, 'minute') % 60;
    const second = dayjs.utc().diff(startedAtUTC, 'second') % 60;
    const totalTimes =
      hour > 0 ? `${hour}時間${minute}分${second}秒` : `${minute}分${second}秒`;

    const joinedMembers = session.joined_member_ids.map(
      (id) => discord.users.cache.get(id)?.username,
    );

    /* Slackの投稿を更新 */
    await slack.chat.update({
      channel: SLACK_LEARNING_CHANNEL_ID,
      ts,
      blocks: finishedBlocks(startedAtFormatted, joinedMembers, totalTimes),
      text: 'Finished learning ✨',
    });

    /* Sessionの削除 */
    await deleteSession(ts);
  }
});

discord.login(DISCORD_BOT_TOKEN);

/* Health check */
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
