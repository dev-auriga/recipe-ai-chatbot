import axios from 'axios';

const API = 'http://localhost:8000';

export const sendMessage = (userId, message) =>
  axios.post(`${API}/chat`, { user_id: userId, message }).then(r => r.data.response);

export const getConversations = (userId) =>
  axios.get(`${API}/conversations/${userId}`).then(r => r.data);
