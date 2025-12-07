"use client";

import React, { useState, useMemo, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Layers, ArrowRight, Search, FileSearch, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { TableLookupCombobox } from "@/components/ui/TableLookupCombobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // <--- رادیو گروپ
import { Label } from "@/components/ui/label";
import { useTabs } from "@/providers/TabsProvider";
import { useSearchParams } from "next/navigation";
import { ColumnConfig } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import VisualTreeDialog from "./VisualTreeDialog";
import { cn } from "@/lib/utils";

interface ProductLookupDto {
  id: number;
  code: string;
  name: string;
}

interface WhereUsedDto {
  id: number;
  bomHeaderId: number;
  bomTitle: string;
  bomVersion: string;
  bomStatus: string;
  parentProductId: number;
  parentProductName: string;
  parentProductCode: string;
  usageType: string;
  quantity: number;
  unitName: string;
}

// نوع گزارش
type ReportMode = "direct" | "multi" | "endItems";

export default function WhereUsedPage() {
  const { closeTab, activeTabId, addTab } = useTabs();
  const searchParams = useSearchParams();

  const initialProductId = searchParams.get("productId")
    ? Number(searchParams.get("productId"))
    : null;
  const initialProductName = searchParams.get("productName") || "";
  const initialProductCode = searchParams.get("productCode") || "";

  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    initialProductId
  );
  const [data, setData] = useState<WhereUsedDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // استیت جدید برای حالت گزارش (پیش‌فرض: مستقیم)
  const [reportMode, setReportMode] = useState<ReportMode>("direct");

  const [treeDialogOpen, setTreeDialogOpen] = useState(false);
  const [selectedTreeRow, setSelectedTreeRow] = useState<WhereUsedDto | null>(
    null
  );

  const [productOptions, setProductOptions] = useState<ProductLookupDto[]>(
    initialProductId
      ? [
          {
            id: initialProductId,
            name: initialProductName,
            code: initialProductCode,
          } as any,
        ]
      : []
  );
  const [productLoading, setProductLoading] = useState(false);

  const handleProductSearch = async (term: string) => {
    setProductLoading(true);
    try {
      const res = await apiClient.post("/Products/search", {
        pageNumber: 1,
        pageSize: 20,
        searchTerm: term,
      });
      setProductOptions(res.data.items || []);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchReport = async (prodId: number | null) => {
    if (!prodId) return;
    setLoading(true);
    try {
      // تبدیل حالت رادیویی به پارامترهای API
      const isMulti = reportMode !== "direct";
      const isEndItems = reportMode === "endItems";

      const res = await apiClient.post("/BOMs/where-used", {
        pageNumber: 1,
        pageSize: 1000,
        productId: prodId,
        multiLevel: isMulti,
        endItemsOnly: isEndItems,
      });

      const mappedItems = (res.data.items || []).map((item: any) => ({
        ...item,
        id: item.bomHeaderId + "_" + Math.random(),
      }));

      setData(mappedItems);
      setTotalCount(res.data.totalCount || 0);
    } catch (error) {
      toast.error("خطا در دریافت گزارش");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialProductId) {
      fetchReport(initialProductId);
    }
  }, [initialProductId]);

  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "parentProductCode", label: "کد محصول نهایی", type: "string" },
      {
        key: "parentProductName",
        label: "نام محصول نهایی",
        type: "string",
        render: (val, row) => (
          <div className="flex flex-col">
            <span className="font-medium">{val}</span>
            <span className="text-[10px] text-muted-foreground">
              {row.bomTitle}
            </span>
          </div>
        ),
      },
      {
        key: "bomVersion",
        label: "نسخه",
        type: "string",
        render: (val) => (
          <span className="dir-ltr font-mono bg-muted px-1 rounded">{val}</span>
        ),
      },
      {
        key: "bomStatus",
        label: "وضعیت",
        type: "string",
        render: (val) => <span className="text-xs">{val}</span>,
      },
      {
        key: "usageType",
        label: "سطح / نوع",
        type: "string",
        render: (val) => (
          <span
            className={cn(
              "text-xs px-2 py-1 rounded border",
              val.includes("سطح")
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            {val}
          </span>
        ),
      },
      {
        key: "quantity",
        label: "ضریب مصرف",
        type: "number",
        render: (val, row) => (
          <span className="font-mono dir-ltr">
            {Number(val).toLocaleString()} {row.unitName}
          </span>
        ),
      },
    ],
    []
  );

  const handleOpenBOM = (row: WhereUsedDto) => {
    addTab(
      `مشاهده BOM ${row.bomVersion}`,
      `/product-engineering/boms/view/${row.bomHeaderId}`
    );
  };

  const handleOpenVisualTree = (row: WhereUsedDto) => {
    setSelectedTreeRow(row);
    setTreeDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/10">
        <div className="flex items-center gap-3">
          <FileSearch className="w-5 h-5 text-muted-foreground" />
          <h1 className="font-bold text-lg">گزارش موارد مصرف (Where Used)</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => closeTab(activeTabId)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* فیلترها */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="w-1/3 min-w-[300px]">
              <label className="text-sm font-medium mb-1 block">
                انتخاب قطعه / ماده اولیه:
              </label>
              <TableLookupCombobox<ProductLookupDto>
                value={selectedProductId}
                items={productOptions}
                loading={productLoading}
                columns={[
                  { key: "code", label: "کد" },
                  { key: "name", label: "نام" },
                ]}
                searchableFields={["code", "name"]}
                displayFields={["code", "name"]}
                onSearch={handleProductSearch}
                onOpenChange={(isOpen) => {
                  if (isOpen && productOptions.length === 0)
                    handleProductSearch("");
                }}
                onValueChange={(id) => setSelectedProductId(id as number)}
                placeholder="جستجوی کالا..."
              />
            </div>

            <Button
              onClick={() => fetchReport(selectedProductId)}
              disabled={!selectedProductId || loading}
              className="mb-[1px]"
            >
              <Search className="ml-2 w-4 h-4" />
              نمایش گزارش
            </Button>
          </div>

          {/* بخش رادیو باتون برای انتخاب نوع گزارش */}
          <div className="mt-4 border-t pt-4">
            <Label className="text-xs text-muted-foreground mb-2 block">
              نوع گزارش:
            </Label>
            <RadioGroup
              defaultValue="direct"
              value={reportMode}
              onValueChange={(v) => setReportMode(v as ReportMode)}
              className="flex flex-row gap-6"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="direct" id="r1" />
                <Label htmlFor="r1" className="cursor-pointer">
                  مصرف مستقیم (سطح ۱)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="multi" id="r2" />
                <Label htmlFor="r2" className="cursor-pointer">
                  چند سطحی (تمام درخت)
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="endItems" id="r3" />
                <Label htmlFor="r3" className="cursor-pointer">
                  فقط محصولات نهایی
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* جدول نتایج */}
        <div className="flex-1 border rounded-lg bg-card overflow-hidden">
          <DataTable<WhereUsedDto>
            columns={columns}
            data={data}
            rowCount={totalCount}
            pagination={{ pageIndex: 0, pageSize: 100 }}
            pageCount={1}
            onPaginationChange={() => {}}
            onSortChange={() => {}}
            onGlobalFilterChange={() => {}}
            sortConfig={null}
            globalFilter=""
            advancedFilters={[]}
            columnFilters={{}}
            onAdvancedFilterChange={() => {}}
            onColumnFilterChange={() => {}}
            onClearAllFilters={() => {}}
            isLoading={loading}
            renderRowActions={(row) => (
              <TooltipProvider delayDuration={0}>
                <div className="flex items-center gap-1 justify-center min-w-fit">
                  {/* دکمه مشاهده فرم - بزرگتر شده */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm" // هنوز sm باشد ولی کلاس ارتفاع را زیاد میکنیم
                        variant="ghost"
                        className="h-9 w-9 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenBOM(row);
                        }}
                      >
                        <Layers className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>مشاهده فرم BOM</TooltipContent>
                  </Tooltip>

                  {/* دکمه گرافیکی جدید - بزرگتر شده */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 text-purple-600 hover:bg-purple-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenVisualTree(row);
                        }}
                      >
                        <Network className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>مشاهده در درخت محصول</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          />
        </div>
      </div>

      {/* مودال درخت گرافیکی */}
      {selectedTreeRow && (
        <VisualTreeDialog
          open={treeDialogOpen}
          onClose={() => setTreeDialogOpen(false)}
          bomId={selectedTreeRow.bomHeaderId}
          rootProductName={selectedTreeRow.parentProductName}
          highlightProductId={selectedProductId}
        />
      )}
    </div>
  );
}
