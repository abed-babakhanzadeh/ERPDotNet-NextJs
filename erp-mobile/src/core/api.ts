import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ IP کامپیوتر خود را با دستور ipconfig پیدا کنید و اینجا بنویسید
// پورت 5000 برای http و 5001 برای https در دات‌نت کور استاندارد است
const API_URL = 'http://192.168.0.241:5000'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;