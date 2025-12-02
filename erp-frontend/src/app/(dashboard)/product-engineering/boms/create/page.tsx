"use client";

import { useState, useEffect, useMemo } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Product } from "@/types";
import { useTabs } from "@/providers/TabsProvider";
import { useFormPersist } from "@/hooks/useFormPersist";
import { Layers, Settings, FileText } from "lucide-react";

// ایمپورت کامپوننت‌های ماژولار جدید
import MasterDetailForm from "@/components/form/MasterDetailForm";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import EditableGrid, { GridColumn } from "@/components/form/EditableGrid";

// تایپ برای اقلام BOM (فقط برای فرانت)
interface BOMRow {
  childProductId: string | number;
  quantity: number;
  wastePercentage: number;
  unitName?: string; // فقط برای نمایش
}

export default function CreateBOMPage() {
  const { closeTab, activeTabId } = useTabs();
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // استیت کلی فرم
  const [headerData, setHeaderData] = useState<any>({
    productId: "",
    title: "",
    version: "1.0",
    type: 1, // 1: Manufacturing
    fromDate: new Date().toISOString().split("T")[0], // امروز
  });

  const [details, setDetails] = useState<BOMRow[]>([]);

  // ذخیره خودکار پیش‌نویس
  useFormPersist("create-bom-header", headerData, setHeaderData);
  useFormPersist("create-bom-details", details, setDetails);

  // دریافت لیست کالاها
  useEffect(() => {
    apiClient.get("/Products").then((res: any) => setProducts(res.data));
  }, []);

  // --- تنظیمات هدر (AutoForm) ---
  const headerFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "productId",
        label: "محصول نهایی",
        type: "select",
        required: true,
        options: products.map((p) => ({
          label: `${p.name} (${p.code})`,
          value: p.id,
        })),
        placeholder: "انتخاب محصولی که تولید می‌شود...",
        colSpan: 1,
      },
      {
        name: "version",
        label: "نسخه فرمول",
        type: "text",
        required: true,
        placeholder: "1.0",
        colSpan: 1,
      },
      {
        name: "title",
        label: "عنوان فرمول",
        type: "text",
        required: true,
        placeholder: "مثال: فرمول استاندارد ۱۴۰۳",
        colSpan: 1,
      },
      {
        name: "type",
        label: "نوع فرمول",
        type: "select",
        required: true,
        options: [
          { label: "تولیدی (Manufacturing)", value: 1 },
          { label: "مهندسی (Engineering)", value: 2 },
        ],
      },
      { name: "fromDate", label: "تاریخ اجرا", type: "date", required: true },
    ],
    [products]
  );

  // --- تنظیمات گرید اقلام (EditableGrid) ---
  const detailColumns: GridColumn<BOMRow>[] = useMemo(
    () => [
      {
        key: "childProductId",
        title: "ماده اولیه / قطعه",
        type: "select",
        required: true,
        width: "40%",
        options: products
          // فیلتر: محصول نهایی نباید در لیست مواد اولیه خودش باشد
          .filter((p) => p.id != headerData.productId)
          .map((p) => ({ label: `${p.name} (${p.code})`, value: p.id })),
      },
      {
        key: "unitName",
        title: "واحد سنجش",
        type: "readonly",
        width: "15%",
        // وقتی کالا انتخاب شد، واحدش را پیدا کن و نمایش بده
        render: (row) => {
          const prod = products.find((p) => p.id == row.childProductId);
          return (
            <span className="text-xs text-muted-foreground">
              {prod?.unitName || "-"}
            </span>
          );
        },
      },
      {
        key: "quantity",
        title: "مقدار مصرف",
        type: "number",
        required: true,
        placeholder: "0",
        width: "20%",
      },
      {
        key: "wastePercentage",
        title: "درصد ضایعات",
        type: "number",
        placeholder: "0",
        width: "15%",
      },
    ],
    [products, headerData.productId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // ولیدیشن ساده فرانت
    if (details.length === 0) {
      toast.error("لطفا حداقل یک ماده اولیه اضافه کنید.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...headerData,
        productId: Number(headerData.productId),
        type: Number(headerData.type),

        // تبدیل فرمت گرید به فرمت API
        details: details.map((d) => ({
          childProductId: Number(d.childProductId),
          quantity: Number(d.quantity),
          wastePercentage: Number(d.wastePercentage),
          substitutes: [], // فعلا خالی
        })),
      };

      await apiClient.post("/BOMs", payload);
      toast.success("فرمول ساخت با موفقیت ایجاد شد");

      // پاک کردن استیت
      setHeaderData({
        productId: "",
        title: "",
        version: "1.0",
        type: 1,
        fromDate: "",
      });
      setDetails([]);
      localStorage.removeItem("create-bom-header");
      localStorage.removeItem("create-bom-details");

      closeTab(activeTabId);
    } catch (error: any) {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(" - ")
        : "خطا در ثبت اطلاعات";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MasterDetailForm
      title="ایجاد BOM جدید"
      onSubmit={handleSubmit}
      submitting={submitting}
      onCancel={() => closeTab(activeTabId)}
      // 1. محتوای هدر
      headerContent={
        <AutoForm
          fields={headerFields}
          data={headerData}
          onChange={(name, val) =>
            setHeaderData((prev: any) => ({ ...prev, [name]: val }))
          }
          className="grid-cols-1 md:grid-cols-3 xl:grid-cols-5" // کاستومایز کردن گرید برای هدر فشرده
        />
      }
      // 2. محتوای تب‌ها
      tabs={[
        {
          key: "components",
          label: "مواد اولیه و قطعات",
          icon: Layers,
          content: (
            <EditableGrid<BOMRow>
              columns={detailColumns}
              data={details}
              onChange={setDetails}
              onAddRow={() => ({
                childProductId: "",
                quantity: 1,
                wastePercentage: 0,
              })}
            />
          ),
        },
        {
          key: "operations",
          label: "عملیات تولید",
          icon: Settings,
          content: (
            <div className="flex items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
              این بخش در فاز بعدی پیاده‌سازی می‌شود (مسیر تولید)
            </div>
          ),
        },
        {
          key: "notes",
          label: "یادداشت‌ها",
          icon: FileText,
          content: (
            <div className="max-w-2xl">
              <label className="text-sm font-medium mb-2 block">
                توضیحات تکمیلی
              </label>
              <textarea
                className="w-full border rounded p-2 text-sm min-h-[100px]"
                placeholder="توضیحات فنی..."
              />
            </div>
          ),
        },
      ]}
    />
  );
}
