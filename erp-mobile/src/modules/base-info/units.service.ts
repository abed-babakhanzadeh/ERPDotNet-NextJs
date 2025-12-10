import api from '../../core/api';

export const unitsService = {
  getAll: async () => {
    // طبق فایل کنترلر، این متد لیست کامل برمی‌گرداند (بدون صفحه‌بندی)
    const response = await api.get('/api/BaseInfo/Units');
    return response.data;
  },
  create: async (title: string, symbol: string) => {
    const response = await api.post('/api/BaseInfo/Units', { title, symbol });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/BaseInfo/Units/${id}`);
    return response.data;
  }
};