/* 開始時 */
const startedBlocks = (startedAt, username) => [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🎉 ${startedAt} 〜`,
    },
  },
  {
    type: 'section',
    text: {
      type: 'plain_text',
      text: '★Discordの自習室が公開中★',
    },
  },
  {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: username,
        },
      },
    ],
  },

  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Clickして参加してみましょう 🥳 →',
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Discordの招待リンク',
      },
      url: 'https://discord.gg/JarxAYjm6C',
    },
  },
];

/* 出入り時 */
const updatedBlocks = (startedAt, usernames) => [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `🎉 ${startedAt} 〜`,
    },
  },
  {
    type: 'section',
    text: {
      type: 'plain_text',
      text: '★Discordの自習室が公開中★',
    },
  },
  {
    type: 'actions',
    elements: [
      ...usernames.map((username) => ({
        type: 'button',
        text: {
          type: 'plain_text',
          text: username,
        },
      })),
    ],
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Clickして参加してみましょう 🥳 →',
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Discordの招待リンク',
      },
      url: 'https://discord.gg/JarxAYjm6C',
    },
  },
];

/* 終了時 */
const finishedBlocks = (startedAt, usernames, totalTimes) => [
  {
    type: 'header',
    text: {
      type: 'plain_text',
      text: `【DONE】${totalTimes}`,
    },
  },
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Discordの自習室は終了しました（${startedAt}〜）`,
      },
    ],
  },
  {
    type: 'context',
    elements: [
      {
        type: 'plain_text',
        text: '[↓JOINED] お疲れさまでした✨',
      },
    ],
  },
  {
    type: 'actions',
    elements: [
      ...usernames.map((username) => ({
        type: 'button',
        text: {
          type: 'plain_text',
          text: username,
        },
      })),
    ],
  },
  {
    type: 'section',
    text: {
      type: 'plain_text',
      text: '自習室の開始はこちらから →',
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Discordの招待リンク',
      },
      url: 'https://discord.gg/JarxAYjm6C',
    },
  },
];

module.exports = { startedBlocks, updatedBlocks, finishedBlocks };
