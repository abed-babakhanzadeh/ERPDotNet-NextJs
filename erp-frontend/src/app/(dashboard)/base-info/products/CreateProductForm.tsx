"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types/baseInfo";
// import { ProductSupplyType } from "@/types/product"; // فرض بر این است که اینام را دارید، اگر نه عدد بگذارید
import { ArrowLeftRight, UploadCloud } from "lucide-react";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateProductForm({ onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  // استیت برای فایل عکس
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    technicalSpec: "",
    unitId: "" as string | number,
    supplyType: 1, // پیش‌فرض: خریدنی
  });

  // آرایه تبدیل واحدها
  const [conversions, setConversions] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get<Unit[]>("/Units").then((res) => setUnits(res.data));
  }, []);

  const addConversionRow = () => {
    setConversions([...conversions, { alternativeUnitId: "", factor: 1 }]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imagePath = null;

      // 1. اگر عکسی انتخاب شده، اول آپلود کن
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        // درخواست به کنترلر Upload که ساختیم
        const uploadRes = await apiClient.post("/Upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imagePath = uploadRes.data.path; // مسیر عکس را از سرور می‌گیریم
      }

      // 2. ساخت پی‌لود نهایی
      const payload = {
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        imagePath: imagePath, // مسیر عکس را اضافه می‌کنیم

        // تبدیل‌ها
        conversions: conversions
          .filter((c) => c.alternativeUnitId && c.factor > 0)
          .map((c) => ({
            alternativeUnitId: Number(c.alternativeUnitId),
            factor: Number(c.factor),
          })),
      };

      await apiClient.post("/Products", payload);
      toast.success("کالا با موفقیت ایجاد شد");
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
      {/* بخش آپلود عکس */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="flex-shrink-0 bg-white p-2 rounded-lg border border-blue-200">
          {file ? (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <UploadCloud className="w-16 h-16 text-blue-300" />
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تصویر کالا (اختیاری)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">فرمت‌های مجاز: JPG, PNG</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کد کالا <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
            placeholder="مثال: 1001"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام کالا <span className="text-red-500">*</span>
          </label>
          <input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
            placeholder="مثال: مانیتور سامسونگ"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            واحد سنجش اصلی <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.unitId}
            onChange={(e) =>
              setFormData({ ...formData, unitId: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value="">انتخاب کنید...</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع تامین <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.supplyType}
            onChange={(e) =>
              setFormData({ ...formData, supplyType: Number(e.target.value) })
            }
            className="w-full rounded-lg border border-gray-300 p-2 text-sm bg-white outline-none focus:border-blue-500"
          >
            <option value={1}>خریدنی</option>
            <option value={2}>تولیدی</option>
            <option value={3}>خدمات</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          مشخصات فنی
        </label>
        <textarea
          rows={3}
          value={formData.technicalSpec}
          onChange={(e) =>
            setFormData({ ...formData, technicalSpec: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <hr className="border-gray-200" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-orange-500" />
            واحدهای فرعی (تبدیل واحد)
          </label>
          <button
            type="button"
            onClick={addConversionRow}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition"
          >
            + افزودن واحد فرعی
          </button>
        </div>

        {conversions.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded border border-dashed">
            بدون واحد فرعی
          </p>
        )}

        <div className="space-y-2">
          {conversions.map((row, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200"
            >
              <span className="text-sm text-gray-600">هر 1 واحد از:</span>
              <select
                className="flex-1 min-w-[100px] rounded border border-gray-300 p-1 text-sm bg-white"
                value={row.alternativeUnitId}
                onChange={(e) =>
                  updateConversionRow(
                    index,
                    "alternativeUnitId",
                    e.target.value
                  )
                }
              >
                <option value="">انتخاب واحد فرعی...</option>
                {units
                  .filter((u) => u.id != Number(formData.unitId))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
              </select>

              <span className="text-sm text-gray-600">=</span>

              <input
                type="number"
                step="0.001"
                placeholder="ضریب"
                className="w-20 rounded border border-gray-300 p-1 text-center text-sm font-bold"
                value={row.factor}
                onChange={(e) =>
                  updateConversionRow(index, "factor", Number(e.target.value))
                }
              />

              <span className="text-xs text-gray-500 w-[60px] truncate text-left dir-ltr">
                {units.find((u) => u.id == Number(formData.unitId))?.title ||
                  "واحد اصلی"}
              </span>

              <button
                type="button"
                onClick={() => removeConversionRow(index)}
                className="text-red-500 hover:bg-red-100 p-1 rounded px-2"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          انصراف
        </button>
        <button
          disabled={loading}
          type="submit"
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-md"
        >
          {loading ? "در حال ذخیره..." : "ثبت کالا"}
        </button>
      </div>
    </form>
  );
}
