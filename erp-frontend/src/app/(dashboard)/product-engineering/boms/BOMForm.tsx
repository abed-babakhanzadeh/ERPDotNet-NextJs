"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import {
  Layers,
  FileText,
  Save,
  Pencil,
  X,
  Loader2,
  CopyPlus,
  Network,
} from "lucide-react";

// Components
import MasterDetailForm from "@/components/form/MasterDetailForm";
import AutoForm, { FieldConfig } from "@/components/form/AutoForm";
import EditableGrid, { GridColumn } from "@/components/form/EditableGrid";
import {
  TableLookupCombobox,
  ColumnDef,
} from "@/components/ui/TableLookupCombobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // دیالوگ برای الگو
import SubstitutesDialog, { SubstituteRow } from "./SubstitutesDialog";

// Hooks & Providers
import { usePermissions } from "@/providers/PermissionProvider";
import { useTabs } from "@/providers/TabsProvider";

// Types
type FormMode = "create" | "edit" | "view";

interface BOMFormProps {
  mode: FormMode;
  bomId?: number;
}

interface ProductLookupDto {
  id: number;
  code: string;
  name: string;
  unitName: string;
}

// اینترفیس برای جستجوی BOM (برای الگو)
interface BOMLookupDto {
  id: number;
  title: string;
  version: string;
  productName: string;
  productCode: string;
}

interface BOMHeaderState {
  productId: number | null;
  productName?: string;
  title: string;
  version: string;
  type: number;
  fromDate: string;
  toDate?: string;
}

interface BOMRow {
  id: string;
  childProductId: number | null;
  childProductCode?: string;
  childProductName?: string;
  unitName?: string;
  quantity: number;
  wastePercentage: number;
  substitutes: SubstituteRow[];
}

export default function BOMForm({ mode, bomId }: BOMFormProps) {
  const { closeTab, activeTabId, addTab } = useTabs();
  const { hasPermission } = usePermissions();

  const isReadOnly = mode === "view";
  const canEdit = hasPermission("ProductEngineering.BOM.Create");

  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- State مدیریت فرم ---
  const [headerData, setHeaderData] = useState<BOMHeaderState>({
    productId: null,
    title: "",
    version: "1.0",
    type: 1,
    fromDate: new Date().toISOString().split("T")[0],
    toDate: undefined,
  });

  const [details, setDetails] = useState<BOMRow[]>([]);

  // --- استیت‌های مودال جایگزین ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  // --- استیت‌های مودال فراخوانی الگو ---
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateOptions, setTemplateOptions] = useState<BOMLookupDto[]>([]);

  // --- Lookup States (Product) ---
  const [headerProductOptions, setHeaderProductOptions] = useState<
    ProductLookupDto[]
  >([]);
  const [headerLoading, setHeaderLoading] = useState(false);
  const [gridProductOptions, setGridProductOptions] = useState<
    ProductLookupDto[]
  >([]);
  const [gridLoading, setGridLoading] = useState(false);

  // --- Load Data (Edit/View) ---
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && bomId) {
      loadBOMData(bomId);
    }
  }, [mode, bomId]);

  // تابعی برای بستن امن تب (رفع ارور Router Update)
  const safeCloseTab = () => {
    setTimeout(() => {
      closeTab(activeTabId);
    }, 0);
  };

  const loadBOMData = async (id: number) => {
    setLoadingData(true);
    try {
      const { data } = await apiClient.get(`/BOMs/${id}`);

      // مپ کردن هدر
      setHeaderData({
        productId: data.productId,
        productName: data.productName,
        title: data.title,
        version: data.version,
        type: data.typeId,
        fromDate: data.fromDate,
        toDate: data.toDate,
      });

      setHeaderProductOptions([
        {
          id: data.productId,
          code: data.productCode,
          name: data.productName,
          unitName: data.unitName,
        } as any,
      ]);

      // مپ کردن دیتیل (از تابع مشترک استفاده می‌کنیم)
      const mappedDetails = mapServerDetailsToRows(data.details);
      setDetails(mappedDetails);
    } catch (error) {
      toast.error("خطا در دریافت اطلاعات BOM");
      safeCloseTab(); // بستن امن
    } finally {
      setLoadingData(false);
    }
  };

  // تابع کمکی: تبدیل دیتای سرور به فرمت ردیف‌های گرید
  const mapServerDetailsToRows = (serverDetails: any[]): BOMRow[] => {
    return serverDetails.map((d: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      childProductId: d.childProductId,
      childProductName: d.childProductName,
      childProductCode: d.childProductCode,
      unitName: d.unitName,
      quantity: d.quantity,
      wastePercentage: d.wastePercentage,
      substitutes: d.substitutes
        ? d.substitutes.map((s: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            substituteProductId: s.substituteProductId,
            productName: s.substituteProductName,
            productCode: s.substituteProductCode,
            priority: s.priority,
            factor: s.factor,
            isMixAllowed: s.isMixAllowed ?? false,
            maxMixPercentage: s.maxMixPercentage ?? 0,
            note: s.note ?? "",
          }))
        : [],
    }));
  };

  // --- Search Logic (Product) ---
  const searchProductsApi = async (term: string) => {
    if (!term && mode === "create") return [];
    const res = await apiClient.post("/Products/search", {
      pageNumber: 1,
      pageSize: 20,
      searchTerm: term,
    });
    return res.data.items || [];
  };

  const onSearchHeader = async (term: string) => {
    setHeaderLoading(true);
    try {
      const items = await searchProductsApi(term);
      setHeaderProductOptions(items);
    } finally {
      setHeaderLoading(false);
    }
  };

  const onSearchGrid = async (term: string) => {
    setGridLoading(true);
    try {
      const items = await searchProductsApi(term);
      setGridProductOptions(items);
    } finally {
      setGridLoading(false);
    }
  };

  // --- Search Logic (Template BOM) ---
  const onSearchTemplate = async (term: string) => {
    setTemplateLoading(true);
    try {
      // استفاده از همان اندپوینت لیست BOM ها
      const res = await apiClient.post("/BOMs/search", {
        pageNumber: 1,
        pageSize: 20,
        searchTerm: term,
      });
      setTemplateOptions(res.data.items || []);
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImportTemplate = async (sourceBomId: number) => {
    setTemplateLoading(true);
    try {
      // گرفتن جزییات BOM انتخاب شده
      const { data } = await apiClient.get(`/BOMs/${sourceBomId}`);

      if (data.details && data.details.length > 0) {
        const newRows = mapServerDetailsToRows(data.details);

        // سوال: آیا جایگزین شود یا اضافه؟ (فعلا جایگزین میکنیم که استانداردتر است)
        // اگر خواستید اضافه شود: setDetails([...details, ...newRows])
        setDetails(newRows);

        toast.success(`${newRows.length} ردیف با موفقیت فراخوانی شد.`);
        setTemplateDialogOpen(false);
      } else {
        toast.warning("BOM انتخاب شده هیچ ردیفی ندارد.");
      }
    } catch (error) {
      toast.error("خطا در فراخوانی الگو");
    } finally {
      setTemplateLoading(false);
    }
  };

  // --- Columns Definitions ---
  const productLookupColumns: ColumnDef[] = useMemo(
    () => [
      { key: "code", label: "کد کالا", width: "30%" },
      { key: "name", label: "نام کالا", width: "50%" },
      { key: "unitName", label: "واحد", width: "20%" },
    ],
    []
  );

  const headerFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "version",
        label: "نسخه",
        type: "text",
        required: true,
        disabled: isReadOnly,
        colSpan: 1,
      },
      {
        name: "title",
        label: "عنوان فرمول",
        type: "text",
        required: true,
        disabled: isReadOnly,
        colSpan: 1,
      },
      {
        name: "type",
        label: "نوع فرمول",
        type: "select",
        required: true,
        disabled: isReadOnly,
        options: [
          { label: "ساخت (Manufacturing)", value: 1 },
          { label: "مهندسی (Engineering)", value: 2 },
          { label: "کیت فروش (Sales)", value: 3 },
        ],
        colSpan: 1,
      },
      {
        name: "fromDate",
        label: "تاریخ اعتبار از",
        type: "date",
        required: true,
        disabled: isReadOnly,
        colSpan: 1,
      },
      {
        name: "toDate",
        label: "تا تاریخ (اختیاری)",
        type: "date",
        required: false,
        disabled: isReadOnly,
        colSpan: 1,
      },
    ],
    [isReadOnly]
  );

  const detailColumns: GridColumn<BOMRow>[] = useMemo(
    () => [
      {
        key: "childProductId",
        title: "ماده اولیه / قطعه",
        type: "select",
        width: "35%",
        required: true,
        disabled: isReadOnly,
        render: (row, index) => (
          <TableLookupCombobox<ProductLookupDto>
            value={row.childProductId}
            items={gridProductOptions}
            loading={gridLoading}
            columns={productLookupColumns}
            searchableFields={["code", "name"]}
            displayFields={["code", "name"]}
            placeholder={row.childProductName || "جستجو..."}
            disabled={isReadOnly}
            onSearch={onSearchGrid}
            onOpenChange={(isOpen) => {
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
      { key: "unitName", title: "واحد", type: "readonly", width: "10%" },
      {
        key: "quantity",
        title: "مقدار",
        type: "number",
        required: true,
        width: "15%",
        disabled: isReadOnly,
      },
      {
        key: "wastePercentage",
        title: "ضایعات %",
        type: "number",
        width: "10%",
        disabled: isReadOnly,
      },
      {
        key: "substitutes",
        title: "جایگزین",
        type: "readonly",
        width: "10%",
        render: (row, index) => {
          const subCount = row.substitutes?.length || 0;
          return (
            <Button
              type="button"
              variant={subCount > 0 ? "default" : "outline"}
              size="sm"
              className={`h-7 text-xs gap-1 ${
                subCount > 0
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "text-muted-foreground border-dashed"
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveRowIndex(index);
                setDialogOpen(true);
              }}
            >
              <Layers className="w-3 h-3" />
              {subCount > 0 ? `(${subCount})` : isReadOnly ? "ندارد" : "تعریف"}
            </Button>
          );
        },
      },
    ],
    [details, gridProductOptions, gridLoading, isReadOnly]
  );

  // --- Actions ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!headerData.productId) {
      toast.error("محصول نهایی انتخاب نشده");
      return;
    }
    if (details.length === 0) {
      toast.error("اقلام فرمول وارد نشده");
      return;
    }

    setSubmitting(true);
    const payload = {
      productId: headerData.productId,
      title: headerData.title,
      version: headerData.version,
      type: Number(headerData.type),
      fromDate: headerData.fromDate,
      toDate: headerData.toDate,
      details: details.map((d) => ({
        childProductId: d.childProductId,
        quantity: Number(d.quantity),
        wastePercentage: Number(d.wastePercentage || 0),
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
      if (mode === "create") {
        await apiClient.post("/BOMs", payload);
        toast.success("BOM با موفقیت ایجاد شد");
      } else if (mode === "edit" && bomId) {
        toast.info("API ویرایش هنوز متصل نشده است");
      }

      // رفع ارور: بستن تب در سیکل بعدی رندر
      safeCloseTab();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "خطا در ثبت اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToEdit = () => {
    if (bomId) addTab(`ویرایش BOM`, `/product-engineering/boms/edit/${bomId}`);
  };

  const headerContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="text-sm font-medium flex gap-1">
            محصول نهایی (Parent)
          </label>
          <TableLookupCombobox<ProductLookupDto>
            value={headerData.productId}
            items={headerProductOptions}
            loading={headerLoading}
            columns={productLookupColumns}
            onSearch={onSearchHeader}
            displayFields={["code", "name"]}
            disabled={isReadOnly || mode === "edit"}
            placeholder={headerData.productName || "جستجو..."}
            onValueChange={(val, item) => {
              setHeaderData((prev) => ({
                ...prev,
                productId: val as number,
                productName: item?.name,
              }));
            }}
          />
        </div>
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
        title={
          mode === "create"
            ? "ایجاد BOM"
            : mode === "view"
            ? `مشاهده BOM: ${headerData.version}`
            : `ویرایش BOM: ${headerData.version}`
        }
        onSubmit={handleSubmit}
        formId="bom-form"
        submitting={submitting}
        isLoading={loadingData}
        headerContent={headerContent}
        headerActions={
          <>
            {/* دکمه انصراف با رفع ارور Router */}
            <Button
              type="button"
              variant="ghost"
              onClick={safeCloseTab}
              disabled={submitting}
              className="h-9 gap-2"
            >
              <X size={16} /> انصراف
            </Button>

            {/* دکمه نمایش ساختار درختی (در حالت مشاهده/ویرایش) */}
            {(mode === "view" || mode === "edit") && bomId && (
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                onClick={() =>
                  addTab(
                    `درخت محصول`,
                    `/product-engineering/boms/tree/${bomId}`
                  )
                }
              >
                <Network size={16} /> ساختار درختی
              </Button>
            )}

            {/* دکمه فراخوانی از الگو (فقط در حالت ایجاد) */}
            {mode === "create" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setTemplateDialogOpen(true)}
                disabled={submitting}
                className="h-9 gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
              >
                <CopyPlus size={16} /> فراخوانی از الگو
              </Button>
            )}

            {mode === "view" && canEdit && (
              <Button
                type="button"
                onClick={handleGoToEdit}
                className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Pencil size={16} /> ویرایش
              </Button>
            )}

            {(mode === "create" || mode === "edit") && (
              <Button
                type="submit"
                form="bom-form"
                disabled={submitting}
                className="h-9 gap-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {mode === "create" ? "ثبت فرمول" : "ذخیره تغییرات"}
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
                readOnly={isReadOnly}
                onAddRow={
                  isReadOnly
                    ? undefined
                    : () => ({
                        id: Math.random().toString(36).substr(2, 9),
                        childProductId: null,
                        quantity: 1,
                        wastePercentage: 0,
                        unitName: "-",
                        substitutes: [],
                      })
                }
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
                  disabled={isReadOnly}
                  className="w-full border rounded-md p-2 min-h-[100px] disabled:bg-muted"
                  placeholder="توضیحات مهندسی..."
                />
              </div>
            ),
          },
        ]}
      />

      {/* --- دیالوگ جایگزین --- */}
      {activeRowIndex !== null && (
        <SubstitutesDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
          }}
          parentProductName={
            details[activeRowIndex]?.childProductName || "نامشخص"
          }
          initialData={details[activeRowIndex]?.substitutes || []}
          onSave={(newSubs) => {
            if (isReadOnly) return;
            const newDetails = [...details];
            newDetails[activeRowIndex].substitutes = newSubs;
            setDetails(newDetails);
          }}
        />
      )}

      {/* --- دیالوگ انتخاب الگو (جدید) --- */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>فراخوانی اقلام از فرمول (الگو)</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <label className="text-sm font-medium mb-2 block">
              انتخاب BOM منبع:
            </label>
            <TableLookupCombobox<BOMLookupDto>
              items={templateOptions}
              loading={templateLoading}
              columns={[
                { key: "productName", label: "نام محصول", width: "40%" },
                { key: "version", label: "ورژن", width: "20%" },
                { key: "title", label: "عنوان", width: "40%" },
              ]}
              searchableFields={["productName", "productCode", "title"]}
              displayFields={["productName", "version"]}
              onSearch={onSearchTemplate}
              onOpenChange={(isOpen) => {
                if (isOpen && templateOptions.length === 0)
                  onSearchTemplate("");
              }}
              onValueChange={(id) => {
                if (id) handleImportTemplate(id as number);
              }}
              placeholder="جستجو بر اساس نام محصول یا عنوان فرمول..."
            />
            <p className="text-xs text-muted-foreground mt-4 leading-5">
              نکته: با انتخاب یک الگو، تمام ردیف‌های فعلی جدول پاک شده و اقلام
              فرمول انتخاب شده جایگزین می‌شوند.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
