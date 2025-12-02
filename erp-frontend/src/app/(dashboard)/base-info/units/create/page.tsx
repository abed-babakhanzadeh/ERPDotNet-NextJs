"use client";

import { useState, useEffect, useMemo } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types";
import { Loader2, Save, X } from "lucide-react";
import BaseFormLayout from "@/components/layout/BaseFormLayout";
import { useTabs } from "@/providers/TabsProvider";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import { Button } from "@/components/ui/button";

export default function CreateUnitPage() {
  const { closeTab, activeTabId } = useTabs();

  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  const [formData, setFormData] = useState<any>({
    title: "",
    symbol: "",
    precision: 0,
    baseUnitId: "", // رشته خالی برای انتخاب نشده
    conversionFactor: 1,
    isActive: true,
  });

  useEffect(() => {
    apiClient
      .get<Unit[]>("/Units")
      .then((res) => setUnits(res.data))
      .finally(() => setLoadingInit(false));
  }, []);

  // کانفیگ فرم: فیلد ضریب را داینامیک می‌کنیم
  const formFields: FieldConfig[] = useMemo(() => {
    const fields: FieldConfig[] = [
      {
        name: "title",
        label: "عنوان واحد",
        type: "text",
        required: true,
        placeholder: "مثال: کیلوگرم",
      },
      {
        name: "symbol",
        label: "نماد (انگلیسی)",
        type: "text",
        required: true,
        placeholder: "kg",
      },
      {
        name: "precision",
        label: "تعداد اعشار",
        type: "number",
        required: true,
      },
      {
        name: "baseUnitId",
        label: "واحد پایه (اختیاری)",
        type: "select",
        options: units.map((u) => ({
          label: `${u.title} (${u.symbol})`,
          value: u.id,
        })),
      },
      { name: "isActive", label: "واحد فعال است", type: "checkbox" },
    ];

    // فقط اگر واحد پایه انتخاب شده باشد، فیلد ضریب را اضافه کن
    if (formData.baseUnitId) {
      fields.splice(4, 0, {
        // درج قبل از چک‌باکس
        name: "conversionFactor",
        label: "ضریب تبدیل",
        type: "number",
        required: true,
        placeholder: "1",
      });
    }

    return fields;
  }, [units, formData.baseUnitId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        baseUnitId: formData.baseUnitId ? Number(formData.baseUnitId) : null,
        conversionFactor: formData.baseUnitId
          ? Number(formData.conversionFactor)
          : 1,
      };

      await apiClient.post("/Units", payload);
      toast.success("واحد جدید ایجاد شد");
      closeTab(activeTabId);
    } catch (error: any) {
      toast.error("خطا در ثبت اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const FORM_ID = "create-unit-form";

  return (
    <BaseFormLayout
      title="تعریف واحد سنجش"
      isLoading={loadingInit}
      onSubmit={handleSubmit}
      formId={FORM_ID}
      headerActions={
        <>
          <Button
            variant="ghost"
            onClick={() => closeTab(activeTabId)}
            disabled={submitting}
            className="h-9 gap-2"
          >
            <X size={16} /> انصراف
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitting}
            className="h-9 gap-2"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            ثبت واحد
          </Button>
        </>
      }
    >
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <AutoForm
          fields={formFields}
          data={formData}
          onChange={(name: any, value: any) =>
            setFormData((prev: any) => ({ ...prev, [name]: value }))
          }
          loading={submitting}
        />

        {/* راهنمای کوچک برای ضریب */}
        {formData.baseUnitId && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100">
            هر 1 <strong>{formData.title || "(واحد جدید)"}</strong> برابر است با{" "}
            <strong>{formData.conversionFactor}</strong> واحد از{" "}
            <strong>
              {units.find((u) => u.id == formData.baseUnitId)?.title}
            </strong>
            .
          </div>
        )}
      </div>
    </BaseFormLayout>
  );
}
