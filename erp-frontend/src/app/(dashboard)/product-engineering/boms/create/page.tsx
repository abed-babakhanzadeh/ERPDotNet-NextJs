"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Layers, Settings, FileText, Save, X, Loader2 } from "lucide-react";

// Components
import MasterDetailForm from "@/components/form/MasterDetailForm";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import EditableGrid, { GridColumn } from "@/components/form/EditableGrid";
import {
  TableLookupCombobox,
  ColumnDef,
} from "@/components/ui/TableLookupCombobox";
import { Button } from "@/components/ui/button";

// Hooks
import { usePermissions } from "@/providers/PermissionProvider"; // <--- ایمپورت پرمیشن
import { useTabs } from "@/providers/TabsProvider";
// ایمپورت SubstituteRow از فایل مودال
import SubstitutesDialog, { SubstituteRow } from "./SubstitutesDialog";
import { cn } from "@/lib/utils";

// Types
interface ProductLookupDto {
  id: number;
  code: string;
  name: string;
  unitName: string;
  supplyType: string;
}

interface BOMHeaderState {
  productId: number | null;
  productName?: string;
  title: string;
  version: string;
  type: number;
  fromDate: string;
}

interface BOMRow {
  id: string;
  childProductId: number | null;
  childProductCode?: string;
  childProductName?: string;
  unitName?: string;
  quantity: number;
  wastePercentage: number;
  // فیلد جدید: لیست جایگزین‌ها
  substitutes: SubstituteRow[];
}

export default function CreateBOMPage() {
  const router = useRouter();
  const { closeTab, activeTabId } = useTabs();
  const { hasPermission } = usePermissions(); // <--- هوک پرمیشن
  const [submitting, setSubmitting] = useState(false);

  // استیت‌های کنترل مودال
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  // --- مدیریت دسترسی ---
  const canCreate = hasPermission("ProductEngineering.BOM.Create");

  // --- State مدیریت فرم ---
  const [headerData, setHeaderData] = useState<BOMHeaderState>({
    productId: null,
    title: "",
    version: "1.0",
    type: 1,
    fromDate: new Date().toISOString().split("T")[0],
  });

  const [details, setDetails] = useState<BOMRow[]>([]);

  // --- تفکیک استیت جستجو برای جلوگیری از تداخل هدر و گرید ---
  const [headerProductOptions, setHeaderProductOptions] = useState<
    ProductLookupDto[]
  >([]);
  const [headerLoading, setHeaderLoading] = useState(false);

  const [gridProductOptions, setGridProductOptions] = useState<
    ProductLookupDto[]
  >([]);
  const [gridLoading, setGridLoading] = useState(false);

  // --- تابع مرکزی جستجو (Logic) ---
  const searchProductsApi = async (term: string) => {
    // اگر متن خالی بود، لیست خالی برگردان (یا ۱۰ تای اول، بسته به سلیقه)
    // اینجا خالی برمی‌گردانیم تا کاربر مجبور به تایپ باشد (پرفورمنس بهتر برای ۶۰ هزار کالا)
    if (!term) return [];

    const res = await apiClient.post("/Products/search", {
      pageNumber: 1,
      pageSize: 20,
      searchTerm: term,
      sortColumn: "name",
      filters: [],
    });
    return res.data.items || [];
  };

  // هندلر جستجو برای هدر
  const onSearchHeader = async (term: string) => {
    setHeaderLoading(true);
    try {
      const items = await searchProductsApi(term);
      setHeaderProductOptions(items);
    } finally {
      setHeaderLoading(false);
    }
  };

  // هندلر جستجو برای گرید
  const onSearchGrid = async (term: string) => {
    setGridLoading(true);
    try {
      const items = await searchProductsApi(term);
      setGridProductOptions(items);
    } finally {
      setGridLoading(false);
    }
  };

  // --- تنظیمات ستون‌های Lookup ---
  const productLookupColumns: ColumnDef[] = useMemo(
    () => [
      { key: "code", label: "کد کالا", width: "30%" },
      { key: "name", label: "نام کالا", width: "50%" },
      { key: "unitName", label: "واحد", width: "20%" },
    ],
    []
  );

  // --- تنظیمات فیلدهای هدر (AutoForm) ---
  const headerFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "version",
        label: "نسخه",
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
        colSpan: 1,
      },
      {
        name: "type",
        label: "نوع فرمول",
        type: "select",
        required: true,
        options: [
          { label: "ساخت (Manufacturing)", value: 1 },
          { label: "مهندسی (Engineering)", value: 2 },
          { label: "کیت فروش (Sales)", value: 3 },
        ],
        colSpan: 1,
      },
      {
        name: "fromDate",
        label: "تاریخ اجرا",
        type: "date",
        required: true,
        colSpan: 1,
      },
    ],
    []
  );

  // --- تنظیمات ستون‌های گرید ---
  const detailColumns: GridColumn<BOMRow>[] = useMemo(
    () => [
      {
        key: "childProductId",
        title: "ماده اولیه / قطعه",
        type: "select",
        width: "40%",
        required: true,
        render: (row, index) => (
          <TableLookupCombobox<ProductLookupDto>
            value={row.childProductId}
            items={gridProductOptions} // <--- استفاده از استیت مخصوص گرید
            loading={gridLoading} // <--- لودینگ مخصوص گرید
            columns={productLookupColumns}
            searchableFields={["code", "name"]}
            displayFields={["code", "name"]}
            placeholder="جستجوی کالا..."
            onSearch={onSearchGrid} // <--- تابع سرچ مخصوص گرید
            onOpenChange={(isOpen) => {
              // وقتی باز شد، اگر خالی بود، سرچ خالی بزن (یا لیست قبلی را پاک کن)
              if (isOpen && gridProductOptions.length === 0) onSearchGrid("");
            }}
            onValueChange={(newId, item) => {
              const newDetails = [...details];
              newDetails[index] = {
                ...newDetails[index],
                childProductId: newId as number,
                childProductName: item?.name,
                childProductCode: item?.code,
                unitName: item?.unitName || "-",
              };
              setDetails(newDetails);
            }}
          />
        ),
      },
      { key: "unitName", title: "واحد", type: "readonly", width: "15%" },
      {
        key: "quantity",
        title: "مقدار",
        type: "number",
        required: true,
        width: "20%",
        placeholder: "0.00",
      },
      {
        key: "wastePercentage",
        title: "ضایعات %",
        type: "number",
        width: "15%",
        placeholder: "0",
      },

      // ستون جدید: عملیات جایگزینی
      {
        key: "substitutes",
        title: "جایگزین",
        type: "readonly",
        width: "10%",
        render: (row, index) => {
          const subCount = row.substitutes?.length || 0;
          return (
            <Button
              // --- اصلاح مهم: جلوگیری از سابمیت فرم ---
              type="button"
              // ----------------------------------------
              variant={subCount > 0 ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-7 text-xs gap-1",
                subCount > 0
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "text-muted-foreground border-dashed"
              )}
              onClick={(e) => {
                e.preventDefault(); // محض اطمینان بیشتر
                e.stopPropagation(); // جلوگیری از انتشار کلیک به سطر جدول (اگر کلیک روی سطر ایونت دارد)
                setActiveRowIndex(index);
                setDialogOpen(true);
              }}
            >
              <Settings className="w-3 h-3" />
              {subCount > 0 ? `(${subCount})` : "تعریف"}
            </Button>
          );
        },
      },
    ],
    [details, gridProductOptions, gridLoading]
  );

  // هندلر ذخیره مودال
  const handleSaveSubstitutes = (newSubs: SubstituteRow[]) => {
    if (activeRowIndex === null) return;

    const newDetails = [...details];
    newDetails[activeRowIndex].substitutes = newSubs;
    setDetails(newDetails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // جلوگیری از رفرش

    // چک کردن دسترسی هنگام سابمیت (لایه امنیتی دوم در فرانت)
    if (!canCreate) {
      toast.error("شما دسترسی ایجاد BOM را ندارید.");
      return;
    }

    setSubmitting(true);

    if (!headerData.productId) {
      toast.error("لطفا محصول نهایی را انتخاب کنید");
      setSubmitting(false);
      return;
    }
    if (details.length === 0) {
      toast.error("لطفا اقلام فرمول را وارد کنید");
      setSubmitting(false);
      return;
    }

    const payload = {
      productId: headerData.productId,
      title: headerData.title,
      version: headerData.version,
      type: Number(headerData.type),
      fromDate: headerData.fromDate,
      details: details.map((d) => ({
        childProductId: d.childProductId,
        quantity: Number(d.quantity),
        wastePercentage: Number(d.wastePercentage || 0),
        // مپ کردن جایگزین‌ها
        substitutes: d.substitutes.map((s) => ({
          substituteProductId: s.substituteProductId,
          priority: Number(s.priority),
          factor: Number(s.factor),
          isMixAllowed: s.isMixAllowed,
          maxMixPercentage: Number(s.maxMixPercentage),
          note: s.note,
        })),
      })),
    };

    try {
      await apiClient.post("/BOMs", payload);
      toast.success("BOM با موفقیت ثبت شد");
      setTimeout(() => {
        closeTab(activeTabId);
      }, 0);
    } catch (error: any) {
      const msg = error.response?.data?.title || "خطا در ثبت اطلاعات";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- رندر هدر فرم (شامل Lookup جداگانه) ---
  const headerContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-sm font-medium flex gap-1">
            محصول نهایی (Parent) <span className="text-red-500">*</span>
          </label>
          <TableLookupCombobox<ProductLookupDto>
            value={headerData.productId}
            items={headerProductOptions} // <--- استیت مخصوص هدر
            loading={headerLoading} // <--- لودینگ مخصوص هدر
            columns={productLookupColumns}
            onSearch={onSearchHeader} // <--- تابع سرچ مخصوص هدر
            displayFields={["code", "name"]}
            placeholder="جستجو بر اساس نام یا کد کالا..."
            onValueChange={(val, item) => {
              setHeaderData((prev) => ({
                ...prev,
                productId: val as number,
                productName: item?.name,
              }));
            }}
          />
        </div>

        {headerData.productId && (
          <div className="flex items-end pb-2">
            <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md border">
              محصول انتخاب شده: {headerData.productName}
            </span>
          </div>
        )}
      </div>

      <AutoForm
        fields={headerFields}
        data={headerData}
        onChange={(name, val) =>
          setHeaderData((prev) => ({ ...prev, [name]: val }))
        }
        className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      />
    </div>
  );

  return (
    <>
      <MasterDetailForm
        title="ایجاد فرمول ساخت (BOM)"
        onSubmit={handleSubmit} // این تابع وقتی دکمه سابمیت هدر فشرده شود هم کار می‌کند
        formId="create-bom-form" // ID برای اتصال دکمه هدر به فرم
        submitting={submitting}
        headerContent={headerContent}
        // دکمه‌های هدر (Action Buttons)
        headerActions={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setTimeout(() => closeTab(activeTabId), 0);
              }}
              disabled={submitting}
              className="h-9 gap-2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
              انصراف
            </Button>

            {/* دکمه ثبت با چک کردن پرمیشن */}
            {canCreate ? (
              <Button
                type="submit"
                form="create-bom-form" // باید با formId یکی باشد
                disabled={submitting}
                className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {submitting ? "در حال ثبت..." : "ثبت فرمول"}
              </Button>
            ) : (
              // اگر دسترسی نداشت، یا مخفی کن یا دکمه غیرفعال با پیام مناسب نشان بده
              <Button
                disabled
                variant="secondary"
                className="h-9 gap-2 opacity-50 cursor-not-allowed"
              >
                <Save size={16} />
                عدم دسترسی
              </Button>
            )}
          </>
        }
        tabs={[
          {
            key: "materials",
            label: "مواد اولیه و قطعات",
            icon: Layers,
            content: (
              <EditableGrid<BOMRow>
                columns={detailColumns}
                data={details}
                onChange={setDetails}
                // اصلاح تولید سطر جدید:
                onAddRow={() => ({
                  id: Math.random().toString(36).substr(2, 9), // تولید یک ID تصادفی موقت
                  childProductId: null,
                  quantity: 1,
                  wastePercentage: 0,
                  unitName: "-",
                  substitutes: [],
                })}
              />
            ),
          },
          {
            key: "notes",
            label: "توضیحات",
            icon: FileText,
            content: (
              <div className="p-4">
                <label className="block text-sm font-medium mb-2">
                  یادداشت فنی
                </label>
                <textarea
                  className="w-full border rounded-md p-2 min-h-[100px]"
                  placeholder="توضیحات مهندسی..."
                />
              </div>
            ),
          },
        ]}
      />

      {/* مودال جایگزین‌ها */}
      {activeRowIndex !== null && (
        <SubstitutesDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          parentProductName={
            details[activeRowIndex]?.childProductName || "نامشخص"
          }
          initialData={details[activeRowIndex]?.substitutes || []}
          onSave={handleSaveSubstitutes}
        />
      )}
    </>
  );
}
