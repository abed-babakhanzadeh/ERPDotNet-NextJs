import api from '../../core/api';

export const usersService = {
  getAll: async () => {
    const response = await api.get('/api/UserAccess/Users'); // طبق مسیر کنترلر
    return response.data;
  },
  // متدهای create و delete مشابه بالا هستند
};