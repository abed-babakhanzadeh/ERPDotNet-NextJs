import api from '../../core/api';

export const productsService = {
  getAll: async (pageNumber = 1, pageSize = 10, keyword = "") => {
    const response = await api.post('/api/Products/search', {
      PageNumber: pageNumber,
      PageSize: pageSize,
      Keyword: keyword,
      AdvancedFilter: null
    });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/Products/${id}`);
    return response.data;
  },

  // ✨ متد جدید برای جستجوی سریع در دراپ‌داون
  searchLookup: async (keyword: string) => {
    // فرض بر این است که همان متد search کار می‌کند
    const response = await api.post('/api/Products/search', {
      PageNumber: 1,
      PageSize: 20,
      Keyword: keyword
    });
    return response.data.items || response.data.data || [];
  }
};