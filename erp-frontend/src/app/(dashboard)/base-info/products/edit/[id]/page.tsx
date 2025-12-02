"use client";

import { useState, useEffect, use, useMemo } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types/baseInfo";
import { Product } from "@/types/product";
import {
  ArrowLeftRight,
  Trash2,
  Edit,
  Eye,
  ZoomIn,
  Loader2,
  Save,
  X,
} from "lucide-react"; // آیکون‌های جدید
import BaseFormLayout from "@/components/layout/BaseFormLayout";
import { useTabs } from "@/providers/TabsProvider";
import { useFormPersist } from "@/hooks/useFormPersist";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import { Button } from "@/components/ui/button"; // دکمه
import ImageViewerModal from "@/components/ui/ImageViewerModal"; // مودال جدید

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const { closeTab, activeTabId } = useTabs();
  const { id } = use(params);
  // یک ID یونیک برای فرم تعریف می‌کنیم
  const FORM_ID = "product-edit-form";
  // --- States ---
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // <--- استیت جدید برای کنترل حالت
  const [showImageModal, setShowImageModal] = useState(false); // برای مودال عکس

  const [units, setUnits] = useState<Unit[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<any>({
    code: "",
    name: "",
    technicalSpec: "",
    unitId: "",
    supplyType: 1,
    isActive: true,
    file: null,
  });
  const [conversions, setConversions] = useState<any[]>([]);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  // --- Hooks ---
  // فقط وقتی در حالت ویرایش هستیم ذخیره خودکار انجام شود (اختیاری)
  const { clearStorage } = useFormPersist(
    `product-${id}`,
    formData,
    setFormData
  );

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, unitsRes] = await Promise.all([
          apiClient.get<Product>(`/Products/${id}`),
          apiClient.get<Unit[]>("/Units"),
        ]);
        const prod = productRes.data;
        setProduct(prod);
        setUnits(unitsRes.data);

        setFormData((prev: any) => ({
          ...prev,
          code: prod.code,
          name: prod.name,
          technicalSpec: prod.technicalSpec || "",
          unitId: prod.unitId,
          supplyType: prod.supplyTypeId || prod.supplyType,
          isActive: prod.isActive ?? true,
        }));

        setConversions(
          prod.conversions?.map((c) => ({
            id: c.id,
            alternativeUnitId: c.alternativeUnitId,
            factor: c.factor,
          })) || []
        );
      } catch (error) {
        toast.error("خطا در دریافت اطلاعات");
        closeTab(activeTabId);
      } finally {
        setLoadingData(false);
      }
    };
    if (id) fetchData();
  }, [id, activeTabId, closeTab]);

  // --- Handlers ---
  const toggleEditMode = () => {
    if (isEditing) {
      // اگر انصراف داد، باید فرم را به حالت اولیه (دیتای سرور) برگردانیم
      // اینجا ساده‌سازی کردیم و فقط استیت را فالس میکنیم (شاید ریلود صفحه بهتر باشد)
      setIsEditing(false);
      setIsImageDeleted(false);
    } else {
      setIsEditing(true);
    }
  };

  const addConversionRow = () =>
    setConversions([
      ...conversions,
      { id: 0, alternativeUnitId: "", factor: 1 },
    ]);
  const removeConversionRow = (index: number) => {
    const n = [...conversions];
    n.splice(index, 1);
    setConversions(n);
  };
  const updateConversionRow = (index: number, f: string, v: any) => {
    const n = [...conversions];
    n[index] = { ...n[index], [f]: v };
    setConversions(n);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmitting(true);
    try {
      let finalImagePath: string | null | undefined = product.imagePath;
      if (isImageDeleted) finalImagePath = null;
      if (formData.file) {
        const uploadData = new FormData();
        uploadData.append("file", formData.file);
        const res = await apiClient.post("/Upload", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        finalImagePath = res.data.path;
      }

      const payload = {
        id: product.id,
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        imagePath: finalImagePath,
        file: undefined,
        conversions: conversions
          .filter((c) => c.alternativeUnitId && c.factor > 0)
          .map((c) => ({
            id: c.id || 0,
            alternativeUnitId: Number(c.alternativeUnitId),
            factor: Number(c.factor),
          })),
      };

      await apiClient.put(`/Products/${product.id}`, payload);
      toast.success("تغییرات ذخیره شد");

      clearStorage();

      // مهم: بعد از ذخیره، صفحه را رفرش نمیکنیم، بلکه دیتای پروداکت را آپدیت میکنیم و به حالت نمایش برمیگردیم
      setProduct({
        ...product,
        ...payload,
        imagePath: finalImagePath || product.imagePath,
      }); // آپدیت لوکال
      setIsEditing(false); // برگشت به حالت نمایش
      setIsImageDeleted(false);
      setFormData((prev: any) => ({ ...prev, file: null })); // پاک کردن فایل انتخاب شده
    } catch (error: any) {
      toast.error("خطا در ذخیره سازی");
    } finally {
      setSubmitting(false);
    }
  };

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5249";

  // --- Fields ---
  const formFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "file",
        label: "تغییر تصویر",
        type: "file",
        colSpan: 1,
        accept: "image/*",
        // در حالت نمایش، فیلد آپلود کلا مخفی شود بهتر است یا غیرفعال؟
        // در حالت نمایش کلا این فیلد را نشان نمیدهیم (چون عکس فعلی را بالا نشان میدهیم)
        disabled: !isEditing,
      },
      {
        name: "isActive",
        label: "کالا فعال است",
        type: "checkbox",
        disabled: !isEditing,
      },
      {
        name: "code",
        label: "کد کالا",
        type: "text",
        required: true,
        colSpan: 1,
        disabled: !isEditing,
      },
      {
        name: "name",
        label: "نام کالا",
        type: "text",
        required: true,
        colSpan: 2,
        disabled: !isEditing,
      },
      {
        name: "unitId",
        label: "واحد سنجش",
        type: "select",
        required: true,
        disabled: !isEditing,
        options: units.map((u) => ({ label: u.title, value: u.id })),
      },
      {
        name: "supplyType",
        label: "نوع تامین",
        type: "select",
        disabled: !isEditing,
        options: [
          { label: "خریدنی", value: 1 },
          { label: "تولیدی", value: 2 },
          { label: "خدمات", value: 3 },
        ],
      },
      {
        name: "technicalSpec",
        label: "مشخصات فنی",
        type: "textarea",
        colSpan: 2,
        disabled: !isEditing,
      },
    ],
    [units, isEditing]
  );

  // فیلتر کردن فیلد فایل در حالت نمایش (که کاربر گیج نشود)
  const visibleFields = isEditing
    ? formFields
    : formFields.filter((f) => f.name !== "file");

  return (
    <BaseFormLayout
      title={
        isEditing
          ? `ویرایش کالا: ${product?.name}`
          : `جزئیات کالا: ${product?.name || "..."}`
      }
      isLoading={loadingData}
      // متد سابمیت را به فرم پاس می‌دهیم
      onSubmit={isEditing ? handleSubmit : undefined}
      // ID فرم را پاس می‌دهیم
      formId={FORM_ID}
      onCancel={isEditing ? toggleEditMode : undefined}
      // --- دکمه‌های هدر (بخش اصلی تغییرات) ---
      headerActions={
        !loadingData && (
          <>
            {!isEditing ? (
              // حالت نمایش: دکمه ویرایش
              <Button
                onClick={toggleEditMode}
                variant="outline"
                className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 h-9"
              >
                <Edit size={16} />
                <span className="hidden sm:inline">ویرایش اطلاعات</span>
                <span className="sm:hidden">ویرایش</span>
              </Button>
            ) : (
              // حالت ویرایش: دکمه‌های انصراف و ذخیره
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleEditMode}
                  disabled={submitting}
                  className="h-9 gap-2 text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                  انصراف
                </Button>

                <Button
                  type="submit"
                  form={FORM_ID} // اتصال دکمه به فرم پایین
                  disabled={submitting}
                  className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {submitting ? "در حال ثبت..." : "ذخیره تغییرات"}
                </Button>
              </>
            )}
          </>
        )
      }
    >
      {/* تغییر ۵: استفاده از flex-grow برای پر کردن فضا اگر نیاز بود */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        {/* بخش نمایش عکس */}
        {product?.imagePath && !isImageDeleted && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div
              className="relative group cursor-zoom-in"
              onClick={() => setShowImageModal(true)}
            >
              <div className="w-24 h-24 rounded overflow-hidden border bg-white shadow-sm">
                <img
                  src={`${BACKEND_URL}${product.imagePath}`}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* لایه هاور برای زوم */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded">
                <ZoomIn className="text-white" size={24} />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">تصویر محصول</p>
                <p className="text-xs opacity-70">
                  برای بزرگنمایی روی تصویر کلیک کنید.
                </p>
              </div>
              {/* دکمه حذف فقط در حالت ویرایش */}
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs w-fit gap-1"
                  onClick={() => setIsImageDeleted(true)}
                  type="button"
                >
                  <Trash2 size={12} /> حذف تصویر
                </Button>
              )}
            </div>
          </div>
        )}

        {/* پیام حذف عکس */}
        {isImageDeleted && isEditing && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm flex items-center justify-between">
            <span>تصویر حذف خواهد شد.</span>
            <button
              type="button"
              onClick={() => setIsImageDeleted(false)}
              className="underline text-xs"
            >
              بازگردانی
            </button>
          </div>
        )}

        {/* فرم */}
        <AutoForm
          fields={visibleFields}
          data={formData}
          onChange={(name, value) =>
            setFormData((prev: any) => ({ ...prev, [name]: value }))
          }
          loading={submitting}
        />
      </div>

      {/* واحدهای فرعی */}
      <div className="bg-card border rounded-lg p-4 mt-4 shadow-sm relative">
        {/* لایه محافظ برای غیرفعال کردن کل بخش در حالت نمایش */}
        {!isEditing && (
          <div className="absolute inset-0 z-10 bg-gray-50/10 cursor-default" />
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-orange-500" />
            واحدهای فرعی
          </h3>
          {isEditing && (
            <button
              type="button"
              onClick={addConversionRow}
              className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition"
            >
              + افزودن واحد
            </button>
          )}
        </div>

        <div className="space-y-3">
          {conversions.map((row, index) => (
            <div
              key={index}
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-muted/30 p-3 rounded-lg border"
            >
              <select
                disabled={!isEditing}
                className="flex-1 min-w-[120px] h-9 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-70"
                value={row.alternativeUnitId}
                onChange={(e) =>
                  updateConversionRow(
                    index,
                    "alternativeUnitId",
                    e.target.value
                  )
                }
              >
                <option value="">انتخاب واحد...</option>
                {units
                  .filter((u) => u.id != formData.unitId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.title}
                    </option>
                  ))}
              </select>
              <span className="text-xs text-muted-foreground">=</span>
              <input
                disabled={!isEditing}
                type="number"
                className="w-24 h-9 rounded-md border border-input bg-background px-3 text-center text-sm font-semibold disabled:opacity-70"
                value={row.factor}
                onChange={(e) =>
                  updateConversionRow(index, "factor", Number(e.target.value))
                }
              />
              <span className="text-xs text-muted-foreground min-w-[60px]">
                {units.find((u) => u.id == formData.unitId)?.title ||
                  "واحد اصلی"}
              </span>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => removeConversionRow(index)}
                  className="h-9 w-9 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md transition ml-auto sm:ml-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          {conversions.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              بدون واحد فرعی
            </div>
          )}
        </div>
      </div>

      {/* مودال نمایش تصویر */}
      {product?.imagePath && (
        <ImageViewerModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          imageUrl={`${BACKEND_URL}${product.imagePath}`}
          altText={product.name}
        />
      )}
    </BaseFormLayout>
  );
}
