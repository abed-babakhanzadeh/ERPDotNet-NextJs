"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types/baseInfo";
import { Product } from "@/types/product";
import {
  ArrowLeftRight,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";

interface Props {
  product: Product; // دیتای فعلی برای ویرایش
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditProductForm({
  product,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  const [file, setFile] = useState<File | null>(null);

  // استیت فرم اصلی
  const [formData, setFormData] = useState({
    code: product.code,
    name: product.name,
    technicalSpec: product.technicalSpec || "",
    unitId: product.unitId,
    supplyType: product.supplyTypeId,
    isActive: product.isActive ?? true,
  });

  // استیت لیست تبدیل‌ها
  const [conversions, setConversions] = useState<any[]>(
    product.conversions?.map((c) => ({
      id: c.id,
      alternativeUnitId: c.alternativeUnitId,
      factor: c.factor,
    })) || []
  );

  useEffect(() => {
    apiClient.get<Unit[]>("/Units").then((res) => setUnits(res.data));
  }, []);

  const addConversionRow = () => {
    setConversions([
      ...conversions,
      { id: 0, alternativeUnitId: "", factor: 1 },
    ]);
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
      // 1. اگر فایل جدید انتخاب شده آپلود کن، وگرنه از مسیر قبلی استفاده کن
      let imagePath = product.imagePath; // پیش‌فرض: عکس قبلی

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        const uploadRes = await apiClient.post("/Upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagePath = uploadRes.data.path;
      }

      // 2. ساخت پی‌لود
      const payload = {
        id: product.id,
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        imagePath: imagePath, // مسیر جدید یا قدیم

        conversions: conversions
          .filter((c) => c.alternativeUnitId && c.factor > 0)
          .map((c) => ({
            id: c.id || 0,
            alternativeUnitId: Number(c.alternativeUnitId),
            factor: Number(c.factor),
          })),
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

  const BACKEND_URL = "http://localhost:5249"; // آدرس بک‌اند برای نمایش عکس

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* بخش ویرایش عکس */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4">
        <div className="flex-shrink-0 bg-white p-1 rounded-lg border border-orange-200 overflow-hidden w-20 h-20 flex items-center justify-center">
          {file ? (
            // پیش‌نمایش فایل جدید انتخاب شده
            <img
              src={URL.createObjectURL(file)}
              alt="New Preview"
              className="w-full h-full object-cover rounded"
            />
          ) : product.imagePath ? (
            // نمایش عکس فعلی سرور
            <img
              src={`${BACKEND_URL}${product.imagePath}`}
              alt="Current"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-orange-300" />
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تغییر تصویر کالا
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
          />
          {!file && product.imagePath && (
            <p className="text-xs text-gray-500 mt-1">
              عکس فعلی حفظ می‌شود مگر اینکه عکس جدیدی انتخاب کنید.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            کد کالا
          </label>
          <input
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نام کالا
          </label>
          <input
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            واحد سنجش اصلی
          </label>
          <select
            required
            value={formData.unitId}
            onChange={(e) =>
              setFormData({ ...formData, unitId: Number(e.target.value) })
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
            نوع تامین
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
          rows={2}
          value={formData.technicalSpec}
          onChange={(e) =>
            setFormData({ ...formData, technicalSpec: e.target.value })
          }
          className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <label
          htmlFor="isActive"
          className="text-sm font-medium text-gray-700 cursor-pointer"
        >
          کالا فعال است
        </label>
      </div>

      <hr className="border-gray-200" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-orange-500" />
            واحدهای فرعی
          </label>
          <button
            type="button"
            onClick={addConversionRow}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition"
          >
            + افزودن
          </button>
        </div>

        <div className="space-y-2">
          {conversions.map((row, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200"
            >
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
                <option value="">انتخاب...</option>
                {units
                  .filter((u) => u.id != formData.unitId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
              </select>

              <span className="text-xs">=</span>

              <input
                type="number"
                step="0.001"
                className="w-20 rounded border border-gray-300 p-1 text-center text-sm font-bold"
                value={row.factor}
                onChange={(e) =>
                  updateConversionRow(index, "factor", Number(e.target.value))
                }
              />

              <span className="text-xs text-gray-500 w-[60px] truncate text-left dir-ltr">
                {units.find((u) => u.id == Number(formData.unitId))?.title ||
                  "اصلی"}
              </span>

              <button
                type="button"
                onClick={() => removeConversionRow(index)}
                className="text-red-500 hover:bg-red-100 p-1 rounded"
              >
                <Trash2 size={16} />
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
          className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 shadow-md"
        >
          {loading ? "در حال ویرایش..." : "ثبت تغییرات"}
        </button>
      </div>
    </form>
  );
}
