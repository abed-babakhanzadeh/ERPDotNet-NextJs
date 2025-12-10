import api from '../../core/api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  login: async (username: string, password: string) => {
    // طبق فایل AuthController.cs، مسیر Route بصورت api/[controller] است
    // پس آدرس میشه: api/Auth/login
    const response = await api.post('/api/Auth/login', {
      username: username,
      password: password
    });
    
    // طبق کد C# شما خروجی این شکلیه: { Token: "...", Message: "..." }
    if (response.data && response.data.token) {
      await SecureStore.setItemAsync('auth_token', response.data.token);
    }
    
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
  }
};