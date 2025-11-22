"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types/baseInfo";
import { ProductConversionInput } from "@/types/product";
import { Plus, Trash2, Box, ArrowLeftRight } from "lucide-react";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateProductForm({ onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  // State اصلی فرم
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    technicalSpec: "",
    unitId: "" as string | number,
    supplyType: 1, // پیش فرض: خریدنی
  });

  // State لیست تبدیل‌ها (Master-Detail)
  const [conversions, setConversions] = useState<ProductConversionInput[]>([]);

  // دریافت لیست واحدها برای دراپ‌داون
  useEffect(() => {
    apiClient.get<Unit[]>("/Units").then(res => setUnits(res.data));
  }, []);

  // افزودن یک سطر خالی به تبدیل‌ها
  const addConversionRow = () => {
    setConversions([...conversions, { alternativeUnitId: "", factor: 1 }]);
  };

  // حذف سطر تبدیل
  const removeConversionRow = (index: number) => {
    const newRows = [...conversions];
    newRows.splice(index, 1);
    setConversions(newRows);
  };

  // آپدیت مقادیر سطر تبدیل
  const updateConversionRow = (index: number, field: keyof ProductConversionInput, value: any) => {
    const newRows = [...conversions];
    newRows[index] = { ...newRows[index], [field]: value };
    setConversions(newRows);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitId) return toast.error("واحد سنجش اصلی را انتخاب کنید");

    setLoading(true);
    try {
      // آماده‌سازی پیلود نهایی
      const payload = {
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        // فیلتر کردن سطرهای ناقص و تبدیل تایپ‌ها
        conversions: conversions
          .filter(c => c.alternativeUnitId && c.factor > 0)
          .map(c => ({
            alternativeUnitId: Number(c.alternativeUnitId),
            factor: Number(c.factor)
          }))
      };

      await apiClient.post("/Products", payload);
      toast.success("کالا با موفقیت ثبت شد");
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.errors 
          ? Object.values(error.response.data.errors).flat().join(" - ") 
          : "خطا در ثبت کالا";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* بخش اطلاعات اصلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">کد کالا</label>
          <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none" placeholder="مثال: 101-001" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کالا</label>
          <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none" placeholder="مثال: کاغذ A4" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">واحد سنجش اصلی (مبنا)</label>
          <select 
            required 
            value={formData.unitId} 
            onChange={e => setFormData({...formData, unitId: e.target.value})} 
            className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white focus:border-blue-500 outline-none"
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
            className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white focus:border-blue-500 outline-none"
          >
            <option value={1}>خریدنی (مواد اولیه)</option>
            <option value={2}>تولیدی (محصول/نیمه ساخته)</option>
            <option value={3}>خدمات</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">مشخصات فنی (اختیاری)</label>
        <textarea 
          rows={2}
          value={formData.technicalSpec} 
          onChange={e => setFormData({...formData, technicalSpec: e.target.value})} 
          className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none" 
        />
      </div>

      <hr className="border-gray-200" />

      {/* بخش تبدیل واحدها (Dynamic Rows) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-orange-500"/>
            واحدهای فرعی و ضرایب تبدیل
          </label>
          <button type="button" onClick={addConversionRow} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition">
            + افزودن واحد فرعی
          </button>
        </div>

        {conversions.length === 0 ? (
          <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg text-gray-400 text-xs">
            این کالا فقط واحد اصلی دارد. (برای افزودن واحد فرعی مثل کارتن دکمه بالا را بزنید)
          </div>
        ) : (
          <div className="space-y-2">
            {conversions.map((row, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">واحد فرعی:</span>
                
                {/* انتخاب واحد فرعی */}
                <select 
                  className="flex-1 min-w-[100px] rounded border border-gray-300 p-1 text-sm"
                  value={row.alternativeUnitId}
                  onChange={e => updateConversionRow(index, 'alternativeUnitId', e.target.value)}
                >
                  <option value="">انتخاب...</option>
                  {units.filter(u => u.id != formData.unitId).map(u => ( // واحد اصلی را نشان نده
                    <option key={u.id} value={u.id}>{u.title}</option>
                  ))}
                </select>

                <span className="text-xs text-gray-500 whitespace-nowrap">=</span>

                {/* ضریب */}
                <input 
                  type="number" 
                  className="w-20 rounded border border-gray-300 p-1 text-center text-sm font-bold"
                  placeholder="ضریب"
                  value={row.factor}
                  onChange={e => updateConversionRow(index, 'factor', Number(e.target.value))}
                />

                <span className="text-xs text-gray-500 whitespace-nowrap text-ellipsis overflow-hidden max-w-[50px]">
                   {units.find(u => u.id == formData.unitId)?.title || "واحد اصلی"}
                </span>

                <button type="button" onClick={() => removeConversionRow(index)} className="text-red-500 hover:bg-red-100 p-1 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">انصراف</button>
        <button disabled={loading} type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? "در حال ثبت..." : "ثبت کالا"}
        </button>
      </div>
    </form>
  );
}