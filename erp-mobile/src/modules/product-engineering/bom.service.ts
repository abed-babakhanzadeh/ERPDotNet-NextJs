// مسیر فایل: src/modules/product-engineering/bom.service.ts
import api from '../../core/api';

// تعریف مدل‌ها برای استفاده در صفحات
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
  bomDetails: any[]; 
}

export const bomService = {
  // دریافت لیست BOMها
  getAll: async (pageNumber = 1, pageSize = 50, keyword = "") => {
    // ⚠️ اصلاح مهم: حذف 'ProductEngineering' از آدرس
    // آدرس صحیح طبق کنترلر شما: api/BOMs/search
    const response = await api.post('/api/BOMs/search', {
      PageNumber: pageNumber,
      PageSize: pageSize,
      Keyword: keyword, // کلمه جستجو با حرف بزرگ (PascalCase) برای دات‌نت
      AdvancedFilter: null
    });
    return response.data;
  },

  // دریافت درخت BOM
  getTree: async (bomId: number) => {
    // ⚠️ اصلاح آدرس
    const response = await api.get(`/api/BOMs/${bomId}/tree`);
    return response.data;
  },

  // ساخت BOM جدید
  create: async (data: CreateBOMDto) => {
    // ⚠️ اصلاح آدرس
    const response = await api.post('/api/BOMs', data);
    return response.data;
  },

  // حذف BOM
  delete: async (id: number) => {
    // ⚠️ اصلاح آدرس
    const response = await api.delete(`/api/BOMs/${id}`);
    return response.data;
  }
};