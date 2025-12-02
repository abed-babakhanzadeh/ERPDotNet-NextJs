"use client";

import { useState, useEffect, useMemo } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types/baseInfo";
import { ArrowLeftRight, Loader2, Save, Trash2, X } from "lucide-react";
import BaseFormLayout from "@/components/layout/BaseFormLayout";
import { useTabs } from "@/providers/TabsProvider";
import { useFormPersist } from "@/hooks/useFormPersist";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import { Button } from "react-day-picker";

export default function CreateProductPage() {
  const { closeTab, activeTabId } = useTabs();
  const FORM_ID = "product-create-form";
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  // استیت اولیه
  const [formData, setFormData] = useState<any>({
    code: "",
    name: "",
    technicalSpec: "",
    unitId: "",
    supplyType: 1,
    file: null, // این باید نال باشد
  });

  const [conversions, setConversions] = useState<any[]>([]);

  const { clearStorage } = useFormPersist(
    "create-product-draft",
    formData,
    setFormData
  );

  useEffect(() => {
    apiClient
      .get<Unit[]>("/Units")
      .then((res) => setUnits(res.data))
      .catch(() => toast.error("خطا در دریافت واحدها"))
      .finally(() => setLoadingUnits(false));
  }, []);

  const formFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "file",
        label: "تصویر محصول",
        type: "file",
        colSpan: 1,
        accept: "image/png, image/jpeg",
      },
      // ... سایر فیلدها ...
      {
        name: "code",
        label: "کد کالا",
        type: "text",
        required: true,
        colSpan: 1,
      },
      {
        name: "name",
        label: "نام کالا",
        type: "text",
        required: true,
        colSpan: 2,
      },
      {
        name: "unitId",
        label: "واحد سنجش اصلی",
        type: "select",
        required: true,
        options: units.map((u) => ({ label: u.title, value: u.id })),
      },
      {
        name: "supplyType",
        label: "نوع تامین",
        type: "select",
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
      },
    ],
    [units]
  );

  // هندلرهای تبدیل واحد (بدون تغییر) ...
  const addConversionRow = () =>
    setConversions([...conversions, { alternativeUnitId: "", factor: 1 }]);
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
    setSubmitting(true);

    try {
      let imagePath = null;

      // آپلود عکس فقط اگر فایلی انتخاب شده باشد (و از نوع File باشد)
      if (formData.file && formData.file instanceof File) {
        const uploadData = new FormData();
        uploadData.append("file", formData.file);

        try {
          const uploadRes = await apiClient.post("/Upload", uploadData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          imagePath = uploadRes.data.path;
        } catch (uploadError) {
          console.error(uploadError);
          toast.error("خطا در آپلود عکس");
          setSubmitting(false);
          return; // اگر آپلود عکس خطا داد، کالا را نساز
        }
      }

      const payload = {
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        imagePath: imagePath,
        file: undefined, // حذف فایل خام از پی‌لود

        conversions: conversions
          .filter((c) => c.alternativeUnitId && c.factor > 0)
          .map((c) => ({
            alternativeUnitId: Number(c.alternativeUnitId),
            factor: Number(c.factor),
          })),
      };

      await apiClient.post("/Products", payload);
      toast.success("کالا با موفقیت ایجاد شد");

      clearStorage();
      closeTab(activeTabId);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(" - ")
        : "خطا در ثبت کالا";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseFormLayout
      title="تعریف کالای جدید"
      isLoading={loadingUnits}
      onSubmit={handleSubmit}
      formId={FORM_ID}
      // چون اینجا همیشه حالت "ایجاد" است، همیشه دکمه‌های ذخیره و انصراف را داریم
      headerActions={
        <>
          <Button
            type="button"
            // variant="ghost"
            onClick={() => closeTab(activeTabId)}
            disabled={submitting}
            className="h-9 gap-2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
            انصراف
          </Button>

          <Button
            type="submit"
            form={FORM_ID} // اتصال به فرم
            disabled={submitting}
            className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {submitting ? "در حال ثبت..." : "ثبت کالا"}
          </Button>
        </>
      }
    >
      {/* تغییر ۵: استفاده از flex-grow برای پر کردن فضا اگر نیاز بود */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <AutoForm
          fields={formFields}
          data={formData}
          onChange={(name, value) =>
            setFormData((prev: any) => ({ ...prev, [name]: value }))
          }
          loading={submitting}
        />
      </div>

      {/* بخش تبدیل واحدها (بدون تغییر) */}
      <div className="bg-card border rounded-lg p-4 mt-4 shadow-sm relative">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-orange-500" />
            واحدهای فرعی
          </h3>
          <button
            type="button"
            onClick={addConversionRow}
            className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md hover:bg-primary/20 transition"
          >
            + افزودن واحد
          </button>
        </div>

        <div className="space-y-3">
          {conversions.map((row, index) => (
            <div
              key={index}
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-muted/30 p-3 rounded-lg border"
            >
              <select
                className="flex-1 min-w-[120px] h-9 rounded-md border border-input bg-background px-3 text-sm"
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
                type="number"
                step="0.001"
                placeholder="ضریب"
                className="w-24 h-9 rounded-md border border-input bg-background px-3 text-center text-sm font-semibold"
                value={row.factor}
                onChange={(e) =>
                  updateConversionRow(index, "factor", Number(e.target.value))
                }
              />
              <span className="text-xs text-muted-foreground min-w-[60px]">
                {units.find((u) => u.id == formData.unitId)?.title ||
                  "واحد اصلی"}
              </span>
              <button
                type="button"
                onClick={() => removeConversionRow(index)}
                className="h-9 w-9 flex items-center justify-center text-destructive hover:bg-destructive/10 rounded-md transition ml-auto sm:ml-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </BaseFormLayout>
  );
}
