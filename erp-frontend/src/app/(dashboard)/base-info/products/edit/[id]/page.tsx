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
  ZoomIn,
  Loader2,
  Save,
  X,
  Package,
  Plus,
} from "lucide-react";
import BaseFormLayout from "@/components/layout/BaseFormLayout";
import { useTabs } from "@/providers/TabsProvider";
import { useFormPersist } from "@/hooks/useFormPersist";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import { Button } from "@/components/ui/button";
import ImageViewerModal from "@/components/ui/ImageViewerModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const { closeTab, activeTabId } = useTabs();
  const { id } = use(params);
  const FORM_ID = "product-edit-form";

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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

  const { clearStorage } = useFormPersist(
    `product-${id}`,
    formData,
    setFormData
  );

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

  const toggleEditMode = () => {
    if (isEditing) {
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
      setProduct({
        ...product,
        ...payload,
        imagePath: finalImagePath || product.imagePath,
      });
      setIsEditing(false);
      setIsImageDeleted(false);
      setFormData((prev: any) => ({ ...prev, file: null }));
    } catch (error: any) {
      toast.error("خطا در ذخیره سازی");
    } finally {
      setSubmitting(false);
    }
  };

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5249";

  const formFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "file",
        label: "تغییر تصویر",
        type: "file",
        colSpan: 1,
        accept: "image/*",
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
      onSubmit={isEditing ? handleSubmit : undefined}
      formId={FORM_ID}
      isSubmitting={submitting}
      onCancel={isEditing ? toggleEditMode : undefined}
      headerActions={
        !loadingData && (
          <>
            {!isEditing ? (
              <Button
                onClick={toggleEditMode}
                variant="outline"
                className="gap-2 h-8 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:text-orange-400"
              >
                <Edit size={16} />
                <span className="hidden sm:inline text-xs">ویرایش</span>
              </Button>
            ) : null}
          </>
        )
      }
    >
      {/* کارت اصلی اطلاعات */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        {/* بخش نمایش عکس */}
        {product?.imagePath && !isImageDeleted && (
          <div className="mb-6 flex items-start gap-4 p-4 bg-gradient-to-l from-blue-50/50 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <div
              className="relative group cursor-zoom-in"
              onClick={() => setShowImageModal(true)}
            >
              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-white shadow-md hover:shadow-lg transition-shadow">
                <img
                  src={`${BACKEND_URL}${product.imagePath}`}
                  alt="Current"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                <ZoomIn className="text-white drop-shadow-lg" size={24} />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  تصویر محصول
                </p>
                <p className="text-xs opacity-70">
                  برای بزرگنمایی روی تصویر کلیک کنید.
                </p>
              </div>
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs w-fit gap-1.5"
                  onClick={() => setIsImageDeleted(true)}
                  type="button"
                >
                  <Trash2 size={12} /> حذف تصویر
                </Button>
              )}
            </div>
          </div>
        )}

        {isImageDeleted && isEditing && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/30 text-sm flex items-center justify-between">
            <span>تصویر حذف خواهد شد.</span>
            <button
              type="button"
              onClick={() => setIsImageDeleted(false)}
              className="underline text-xs hover:no-underline"
            >
              بازگردانی
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
            اطلاعات اصلی کالا
          </h3>
        </div>

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
      <div className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
        {!isEditing && (
          <div className="absolute inset-0 z-10 bg-slate-50/10 dark:bg-slate-950/10 cursor-not-allowed rounded-xl" />
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
              <ArrowLeftRight className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              واحدهای فرعی
            </h3>
          </div>

          {isEditing && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={addConversionRow}
                    size="sm"
                    className="h-8 gap-2 bg-gradient-to-l from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm"
                  >
                    <Plus size={14} />
                    <span className="text-xs">افزودن واحد</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>افزودن واحد فرعی جدید</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="space-y-3">
          {conversions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>بدون واحد فرعی</p>
            </div>
          ) : (
            conversions.map((row, index) => (
              <div
                key={index}
                className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gradient-to-l from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30 hover:border-orange-200 dark:hover:border-orange-800/50 transition-colors"
              >
                <select
                  disabled={!isEditing}
                  className="flex-1 min-w-[120px] h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm disabled:opacity-70 focus:ring-2 focus:ring-orange-500/20 transition-all"
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

                <span className="text-xs text-slate-400 font-bold">=</span>

                <input
                  disabled={!isEditing}
                  type="number"
                  className="w-24 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-center text-sm font-semibold disabled:opacity-70 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  value={row.factor}
                  onChange={(e) =>
                    updateConversionRow(index, "factor", Number(e.target.value))
                  }
                />

                <span className="text-xs text-slate-500 min-w-[60px] font-medium">
                  {units.find((u) => u.id == formData.unitId)?.title ||
                    "واحد اصلی"}
                </span>

                {isEditing && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeConversionRow(index)}
                          className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-auto sm:ml-0"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>حذف این واحد</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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
