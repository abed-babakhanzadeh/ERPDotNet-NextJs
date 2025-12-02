"use client";

import { useState, useEffect, use, useMemo } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Unit } from "@/types";
import { Loader2, Save, X, Edit } from "lucide-react";
import BaseFormLayout from "@/components/layout/BaseFormLayout";
import { useTabs } from "@/providers/TabsProvider";
import AutoForm, { FieldConfig } from "@/components/layout/AutoForm";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UnitDetailsPage({ params }: PageProps) {
  const { closeTab, activeTabId } = useTabs();
  const { id } = use(params);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [units, setUnits] = useState<Unit[]>([]);
  const [unit, setUnit] = useState<Unit | null>(null);

  const [formData, setFormData] = useState<any>({
    title: "",
    symbol: "",
    precision: 0,
    baseUnitId: "",
    conversionFactor: 1,
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitRes, listRes] = await Promise.all([
          apiClient.get<Unit>(`/Units/${id}`),
          apiClient.get<Unit[]>("/Units"),
        ]);

        setUnit(unitRes.data);
        setUnits(listRes.data);

        setFormData({
          title: unitRes.data.title,
          symbol: unitRes.data.symbol,
          precision: unitRes.data.precision,
          baseUnitId: unitRes.data.baseUnitId
            ? String(unitRes.data.baseUnitId)
            : "",
          conversionFactor: unitRes.data.conversionFactor,
          isActive: unitRes.data.isActive,
        });
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
      // Reset form on cancel
      if (unit) {
        setFormData({
          title: unit.title,
          symbol: unit.symbol,
          precision: unit.precision,
          baseUnitId: unit.baseUnitId ? String(unit.baseUnitId) : "",
          conversionFactor: unit.conversionFactor,
          isActive: unit.isActive,
        });
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        id: Number(id),
        ...formData,
        baseUnitId: formData.baseUnitId ? Number(formData.baseUnitId) : null,
        conversionFactor: formData.baseUnitId
          ? Number(formData.conversionFactor)
          : 1,
      };

      await apiClient.put(`/Units/${id}`, payload);
      toast.success("تغییرات ذخیره شد");

      // آپدیت دیتای لوکال
      setUnit((prev) => (prev ? { ...prev, ...payload } : null));
      setIsEditing(false);
    } catch (error: any) {
      toast.error("خطا در ویرایش اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const formFields: FieldConfig[] = useMemo(() => {
    const fields: FieldConfig[] = [
      {
        name: "title",
        label: "عنوان واحد",
        type: "text",
        required: true,
        disabled: !isEditing,
      },
      {
        name: "symbol",
        label: "نماد",
        type: "text",
        required: true,
        disabled: !isEditing,
      },
      {
        name: "precision",
        label: "تعداد اعشار",
        type: "number",
        required: true,
        disabled: !isEditing,
      },
      {
        name: "baseUnitId",
        label: "واحد پایه",
        type: "select",
        disabled: !isEditing,
        // فیلتر کردن خود واحد برای جلوگیری از چرخه (Unit cannot be its own base)
        options: units
          .filter((u) => u.id !== Number(id))
          .map((u) => ({ label: `${u.title} (${u.symbol})`, value: u.id })),
      },
      {
        name: "isActive",
        label: "فعال است",
        type: "checkbox",
        disabled: !isEditing,
      },
    ];

    if (formData.baseUnitId) {
      fields.splice(4, 0, {
        name: "conversionFactor",
        label: "ضریب تبدیل",
        type: "number",
        required: true,
        disabled: !isEditing,
      });
    }
    return fields;
  }, [units, formData.baseUnitId, isEditing, id]);

  const FORM_ID = "edit-unit-form";

  return (
    <BaseFormLayout
      title={
        isEditing
          ? `ویرایش: ${unit?.title}`
          : `جزئیات واحد: ${unit?.title || "..."}`
      }
      isLoading={loadingData}
      onSubmit={isEditing ? handleSubmit : undefined}
      formId={FORM_ID}
      onCancel={isEditing ? toggleEditMode : undefined}
      headerActions={
        !loadingData &&
        (isEditing ? (
          <>
            <Button
              variant="ghost"
              onClick={toggleEditMode}
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
              ذخیره
            </Button>
          </>
        ) : (
          <Button
            onClick={toggleEditMode}
            variant="outline"
            className="h-9 gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <Edit size={16} /> ویرایش اطلاعات
          </Button>
        ))
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

        {/* نمایش پیام در حالت نمایش فقط اگر ضریب دارد */}
        {unit?.baseUnitId && !isEditing && (
          <div className="mt-4 text-sm text-muted-foreground">
            هر 1 {unit.title} = {unit.conversionFactor}{" "}
            {units.find((u) => u.id === unit.baseUnitId)?.title}
          </div>
        )}
      </div>
    </BaseFormLayout>
  );
}
