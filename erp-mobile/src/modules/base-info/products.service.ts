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
  },

  // متد ساخت با عکس
  create: async (data: any, imageUri?: string) => {
    const formData = new FormData();
    
    // اضافه کردن فیلدهای متنی
    formData.append('Name', data.name);
    formData.append('Code', data.code);
    formData.append('SupplyTypeId', data.supplyTypeId.toString());
    formData.append('UnitId', data.unitId.toString());
    formData.append('IsActive', 'true');

    // اضافه کردن فایل عکس
    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;
      
      // @ts-ignore
      formData.append('ImageFile', { uri: imageUri, name: filename, type });
    }

    const response = await api.post('/api/Products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};