require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { WebClient } = require('@slack/web-api');
const { format, parseISO, formatDistanceToNow } = require('date-fns');
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
    oldChannel && oldChannel.id === DISCORD_LEARNING_CHANNEL_ID;

  /* 人数が変化していない場合 */
  if (oldChannel === newChannel) return;

  /* 最初の一人を検知 */
  if (isStarting) {
    try {
      const nowFormatted = format(new Date(), 'yyyy/MM/dd HH:mm:ss', {
        timeZone: 'Asia/Tokyo',
      });

      /* Slackへの通知 */
      const response = await slack.chat.postMessage({
        channel: SLACK_LEARNING_CHANNEL_ID,
        blocks: startedBlocks(nowFormatted, newState.member.user.username),
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

  if (isUpdating) {
    /* 最新のSessionのtsを取得 */
    const session = await getLatestSession();
    if (!session) return;
    const ts = session.slack_timestamp;
    const startedAtFormatted = format(
      parseISO(session.created_at),
      'yyyy/MM/dd HH:mm:ss',
      {
        timeZone: 'Asia/Tokyo',
      },
    );
    const members = newChannel.members.map((member) => member.user.username);

    /* Slackの投稿を更新 */
    await slack.chat.update({
      channel: SLACK_LEARNING_CHANNEL_ID,
      ts,
      blocks: updatedBlocks(startedAtFormatted, members),
      text: 'Started learning 🎉',
    });

    /* Sessionを更新 */
    const joinedIds = newChannel.members.map((member) => member.user.id);
    await updateSession(ts, { joined_member_ids: joinedIds });
  }

  /* 最後の一人を検知 */
  if (isFinishing) {
    /* 最新のSessionのtsを取得 */
    const session = await getLatestSession();
    if (!session) return;
    const ts = session.slack_timestamp;
    const startedAtFormatted = format(
      parseISO(session.created_at),
      'yyyy/MM/dd HH:mm:ss',
      {
        timeZone: 'Asia/Tokyo',
      },
    );
    const joinedMembers = session.joined_member_ids.map(
      (id) => discord.users.cache.get(id)?.username,
    );
    const totalTimes = formatDistanceToNow(parseISO(session.created_at), {
      timeZone: 'Asia/Tokyo',
    });

    /* Slackの投稿を更新 */
    slack.chat.update({
      channel: SLACK_LEARNING_CHANNEL_ID,
      ts,
      blocks: finishedBlocks(startedAtFormatted, joinedMembers, totalTimes),
      text: 'Started learning 🎉',
    });

    /* ルームの削除 */
    deleteSession(ts);
  }
});

discord.login(DISCORD_BOT_TOKEN);
