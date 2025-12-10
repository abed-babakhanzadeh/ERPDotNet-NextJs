import api from '../../core/api';

// تعریف دقیق مدل‌ها
export interface BOMDto {
  id: number;
  title: string;
  code: string;
  version: number;
}

export interface CreateBOMDto {
  productId: number;
  title: string;
  code: string;
  // فعلا دیتیل را خالی می‌فرستیم تا هدر ساخته شود
  bomDetails: any[]; 
}

export const bomService = {
  // 🔍 رفع مشکل جستجو: پارامترها با حرف بزرگ ارسال می‌شوند
  getAll: async (pageNumber = 1, pageSize = 50, keyword = "") => {
    const response = await api.post('/api/BOMs/search', {
      PageNumber: pageNumber,
      PageSize: pageSize,
      Keyword: keyword, // اینجا کلیدواژه جستجو ارسال می‌شود
      AdvancedFilter: null
    });
    return response.data;
  },

  getTree: async (bomId: number) => {
    const response = await api.get(`/api/BOMs/${bomId}/tree`);
    return response.data;
  },

  // ✨ متد جدید برای ساخت BOM
  create: async (data: CreateBOMDto) => {
    const response = await api.post('/api/BOMs', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/BOMs/${id}`);
    return response.data;
  }
};