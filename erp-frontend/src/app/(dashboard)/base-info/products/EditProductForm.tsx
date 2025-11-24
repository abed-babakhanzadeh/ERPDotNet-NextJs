"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types/baseInfo";
import { Product } from "@/types/product";
import { Trash2, ArrowLeftRight } from "lucide-react";

interface Props {
  product: Product; // دیتای فعلی برای ویرایش
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditProductForm({ product, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  // استیت فرم اصلی
  const [formData, setFormData] = useState({
    code: product.code,
    name: product.name,
    technicalSpec: "", // اگر بک‌اند این فیلد را برگرداند اینجا ست کنید: product.technicalSpec
    unitId: product.unitId,       // استفاده از ID که تازه اضافه کردیم
    supplyType: product.supplyTypeId, // استفاده از ID که تازه اضافه کردیم
    isActive: true 
  });

  // استیت لیست تبدیل‌ها
  // نکته: ما id سطر را نگه می‌داریم تا بک‌اند بفهمد این یک رکورد قدیمی است
  const [conversions, setConversions] = useState<any[]>(
    product.conversions.map(c => ({
      id: c.id, 
      alternativeUnitId: c.alternativeUnitId,
      factor: c.factor
    }))
  );

  useEffect(() => {
    // دریافت لیست واحدها برای دراپ‌داون
    apiClient.get<Unit[]>("/Units").then(res => setUnits(res.data));
  }, []);

  // --- عملیات روی سطرهای تبدیل ---
  const addConversionRow = () => {
    // سطر جدید ID ندارد (یا 0 است)
    setConversions([...conversions, { id: 0, alternativeUnitId: "", factor: 1 }]);
  };

  const removeConversionRow = (index: number) => {
    const newRows = [...conversions];
    newRows.splice(index, 1);
    setConversions(newRows);
  };

  const updateConversionRow = (index: number, field: string, value: any) => {
    const newRows = [...conversions];
    newRows[index] = { ...newRows[index], [field]: value };
    setConversions(newRows);
  };

  // --- ذخیره تغییرات ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        id: product.id,
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        
        // فیلتر و مپ کردن تبدیل‌ها
        conversions: conversions
          .filter(c => c.alternativeUnitId && c.factor > 0)
          .map(c => ({
            id: c.id || 0, // 0 = جدید، عدد = ویرایش
            alternativeUnitId: Number(c.alternativeUnitId),
            factor: Number(c.factor)
          }))
      };

      await apiClient.put(`/Products/${product.id}`, payload);
      toast.success("کالا با موفقیت ویرایش شد");
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(" - ") 
          : "خطا در ویرایش کالا";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">کد کالا</label>
          <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کالا</label>
          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">واحد سنجش اصلی</label>
          <select 
            required 
            value={formData.unitId} 
            onChange={e => setFormData({...formData, unitId: Number(e.target.value)})} 
            className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="">انتخاب کنید...</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوع تامین</label>
          <select 
            value={formData.supplyType} 
            onChange={e => setFormData({...formData, supplyType: Number(e.target.value)})} 
            className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value={1}>خریدنی</option>
            <option value={2}>تولیدی</option>
            <option value={3}>خدمات</option>
          </select>
        </div>
      </div>

       <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isActive"
            checked={formData.isActive}
            onChange={e => setFormData({...formData, isActive: e.target.checked})}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">کالا فعال است</label>
      </div>

      <hr className="border-gray-200" />

      {/* بخش تبدیل واحدها */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-orange-500"/>
            واحدهای فرعی
          </label>
          <button type="button" onClick={addConversionRow} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition">
            + افزودن
          </button>
        </div>

        <div className="space-y-2">
            {conversions.map((row, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <select 
                  className="flex-1 min-w-[100px] rounded border border-gray-300 p-1 text-sm"
                  value={row.alternativeUnitId}
                  onChange={e => updateConversionRow(index, 'alternativeUnitId', e.target.value)}
                >
                  <option value="">انتخاب...</option>
                  {/* واحد اصلی را از لیست حذف می‌کنیم تا کاربر اشتباه نکند */}
                  {units.filter(u => u.id != formData.unitId).map(u => (
                    <option key={u.id} value={u.id}>{u.title}</option>
                  ))}
                </select>

                <span className="text-xs">=</span>

                <input 
                  type="number" 
                  className="w-20 rounded border border-gray-300 p-1 text-center text-sm font-bold"
                  value={row.factor}
                  onChange={e => updateConversionRow(index, 'factor', Number(e.target.value))}
                />

                <span className="text-xs text-gray-500 w-[60px] truncate text-left dir-ltr">
                   {units.find(u => u.id == formData.unitId)?.title || "اصلی"}
                </span>

                <button type="button" onClick={() => removeConversionRow(index)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">انصراف</button>
        <button disabled={loading} type="submit" className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
          {loading ? "در حال ویرایش..." : "ثبت تغییرات"}
        </button>
      </div>
    </form>
  );
}