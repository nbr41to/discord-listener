require('dotenv').config();
const axios = require('axios');
const PROGLEARNING_API_URL = process.env.PROGLEARNING_API_URL;
const PROGLEARNING_API_KEY = process.env.PROGLEARNING_API_KEY;
const encodedApiKey = Buffer.from(PROGLEARNING_API_KEY).toString('base64');

axios.defaults.headers.common['Authorization'] = 'Bearer ' + encodedApiKey;
axios.defaults.headers.common['Content-Type'] = 'application/json';

/* 最新のSessionを取得 */
const getLatestSession = async () => {
  try {
    const response = await axios.get(PROGLEARNING_API_URL);
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionの新規作成 */
const createSession = async (params) => {
  try {
    const response = await axios.post(PROGLEARNING_API_URL, params);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionの更新 */
const updateSession = async (ts, params) => {
  try {
    const response = await axios.patch(`${PROGLEARNING_API_URL}/${ts}`, params);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);

    return;
  }
};

/* Sessionの削除 */
const deleteSession = async (ts) => {
  try {
    const response = await axios.delete(`${PROGLEARNING_API_URL}/${ts}`);
    if (response.status === 200) {
      return response.data;
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
