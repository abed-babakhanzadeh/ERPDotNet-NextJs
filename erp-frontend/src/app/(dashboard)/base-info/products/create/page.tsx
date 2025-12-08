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
import { Button } from "@/components/ui/button";

export default function CreateProductPage() {
  const { closeTab, activeTabId } = useTabs();
  const FORM_ID = "product-create-form";
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  const [formData, setFormData] = useState<any>({
    code: "",
    name: "",
    technicalSpec: "",
    unitId: "",
    supplyType: 1,
    file: null,
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
          return;
        }
      }

      const payload = {
        ...formData,
        unitId: Number(formData.unitId),
        supplyType: Number(formData.supplyType),
        imagePath: imagePath,
        file: undefined,

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
      onCancel={() => closeTab(activeTabId)}
      saveDisabled={submitting}
      saveLabel={submitting ? "در حال ثبت..." : "ثبت کالا"}
      saveIcon={
        submitting ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Save size={14} />
        )
      }
    >
      <div className="bg-card border rounded-lg p-4 md:p-6 shadow-sm">
        <AutoForm
          fields={formFields}
          data={formData}
          onChange={(name, value) =>
            setFormData((prev: any) => ({ ...prev, [name]: value }))
          }
          loading={submitting}
        />
      </div>

      {/* بخش تبدیل واحدها */}
      <div className="bg-card border rounded-lg p-3 md:p-4 mt-3 md:mt-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-orange-500" />
            واحدهای فرعی
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConversionRow}
            className="h-6 text-[10px] px-2"
          >
            + افزودن واحد
          </Button>
        </div>

        <div className="space-y-2">
          {conversions.map((row, index) => (
            <div
              key={index}
              className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-muted/30 p-2 rounded-lg border"
            >
              <select
                className="flex-1 min-w-[120px] h-8 rounded-md border border-input bg-background px-2 text-xs"
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
              <span className="text-[10px] text-muted-foreground">=</span>
              <input
                type="number"
                step="0.001"
                placeholder="ضریب"
                className="w-20 h-8 rounded-md border border-input bg-background px-2 text-center text-xs font-semibold"
                value={row.factor}
                onChange={(e) =>
                  updateConversionRow(index, "factor", Number(e.target.value))
                }
              />
              <span className="text-[10px] text-muted-foreground min-w-[50px]">
                {units.find((u) => u.id == formData.unitId)?.title ||
                  "واحد اصلی"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeConversionRow(index)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded ml-auto md:ml-0"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </BaseFormLayout>
  );
}
