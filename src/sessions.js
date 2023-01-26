require('dotenv').config();
const PROGLEARNING_API_URL = process.env.PROGLEARNING_API_URL;
const PROGLEARNING_API_KEY = process.env.PROGLEARNING_API_KEY;
const encodedApiKey = Buffer.from(PROGLEARNING_API_KEY).toString('base64');

/* 最新のSessionを取得 */
const getLatestSession = async () => {
  try {
    const response = await fetch(PROGLEARNING_API_URL, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + encodedApiKey,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 200) {
      return response.json();
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionの新規作成 */
const createSession = async (params) => {
  try {
    const response = await fetch(PROGLEARNING_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + encodedApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.status === 200) {
      return response.json();
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionの更新 */
const updateSession = async (ts, params) => {
  try {
    const response = await fetch(`${PROGLEARNING_API_URL}/${ts}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + encodedApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (response.status === 200) {
      return response.json();
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionの削除 */
const deleteSession = async (ts) => {
  try {
    const response = await fetch(`${PROGLEARNING_API_URL}/${ts}`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + encodedApiKey,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 200) {
      return response.json();
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

module.exports = {
  getLatestSession,
  createSession,
  updateSession,
  deleteSession,
};
