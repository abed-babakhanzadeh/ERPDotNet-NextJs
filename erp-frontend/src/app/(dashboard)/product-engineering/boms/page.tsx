"use client";

import React, { useMemo, useState } from "react";
import { ColumnConfig } from "@/types";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Layers, Plus, Eye, Pencil, Copy, Trash2, Network } from "lucide-react";

// Components
import ProtectedPage from "@/components/ui/ProtectedPage"; // استاندارد جدید
import PermissionGuard from "@/components/ui/PermissionGuard"; // استاندارد جدید
import MasterDetailLayout from "@/components/ui/MasterDetailLayout"; // لی‌اوت استاندارد
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Dialogs
import NewVersionDialog from "./NewVersionDialog";

// Hooks
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTabs } from "@/providers/TabsProvider";
import { useTabPrefetch } from "@/hooks/useTabPrefetch";

// DTO
interface BOMListDto {
  id: number;
  productName: string;
  productCode: string;
  version: string;
  title: string;
  type: string;
  status: string;
  isActive: boolean;
  fromDate: string;
}

export default function BOMsListPage() {
  const { addTab } = useTabs();

  // استیت‌های مودال کپی
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMListDto | null>(null);

  // Prefetch
  useTabPrefetch(["/product-engineering/boms/create"]);

  // DataTable Hook
  const { tableProps, refresh } = useServerDataTable<BOMListDto>({
    endpoint: "/BOMs/search",
    initialPageSize: 10,
  });

  // --- تعریف ستون‌ها ---
  const columns: ColumnConfig[] = useMemo(
    () => [
      // 1. ستون شماره (بدون کپی)
      {
        key: "id",
        label: "شماره",
        type: "number",
        width: "8%",
        render: (val) => (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-[10px]">#</span>
            <span className="font-mono font-medium text-foreground">{val}</span>
          </div>
        ),
      },
      // 4. عنوان فرمول
      {
        key: "title",
        label: "عنوان فرمول",
        type: "string",
        width: "20%",
        render: (val) => (
          <span className="text-sm text-muted-foreground">{val || "-"}</span>
        ),
      },
      // 2. کد محصول
      {
        key: "productCode",
        label: "کد محصول",
        type: "string",
        width: "10%",
      },
      // 3. نام محصول
      {
        key: "productName",
        label: "نام محصول",
        type: "string",
        width: "20%",
        render: (val) => <span className="font-medium text-sm">{val}</span>,
      },

      // 5. تاریخ اعتبار (شمسی سازی شده)
      {
        key: "fromDate",
        label: "تاریخ شروع",
        type: "string", // برای جستجو استرینگ می‌فرستیم
        width: "12%",
        render: (val) => {
          if (!val) return "-";
          // تبدیل تاریخ میلادی به شمسی
          return (
            <span className="text-xs dir-ltr font-mono">
              {new Date(val).toLocaleDateString("fa-IR")}
            </span>
          );
        },
      },
      // 6. نسخه
      {
        key: "version",
        label: "نسخه",
        type: "string",
        width: "8%",
        render: (val) => (
          <Badge
            variant="outline"
            className="dir-ltr font-mono bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-1.5"
          >
            v{val}
          </Badge>
        ),
      },
      // 7. نوع فرمول
      {
        key: "type",
        label: "نوع",
        type: "string",
        width: "10%",
        render: (val) => <span className="text-xs">{val}</span>,
      },
      // 8. وضعیت (شامل نشانگر فعال/غیرفعال)
      {
        key: "status",
        label: "وضعیت",
        type: "string",
        width: "12%",
        render: (val, row: BOMListDto) => {
          // ۱. اولویت با غیرفعال بودن است
          if (row.isActive === false) {
            return (
              <div className="flex items-center">
                {/* اگر وضعیت قبلی چیزی غیر از "فعال" بوده (مثلا "تایید شده")، خط خورده نشان بده */}
                {/* اما اگر "فعال" بوده، کلا نشان نده چون الان غیرفعاله */}
                {val !== "فعال" && val !== "Active" && (
                  <span className="text-[10px] text-muted-foreground line-through ml-2">
                    {val}
                  </span>
                )}

                <Badge
                  variant="destructive"
                  className="h-5 px-2 text-[10px] shadow-sm w-full justify-center bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
                >
                  غیرفعال
                </Badge>
              </div>
            );
          }

          // ۲. اگر فعال است، بج‌های رنگی نشان بده
          let colorClass = "bg-gray-100 text-gray-700 border-gray-200";

          if (val.includes("فعال") || val.includes("Active"))
            colorClass =
              "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm";
          if (val.includes("منسوخ") || val.includes("Obsolete"))
            colorClass = "bg-red-50 text-red-700 border-red-200";
          if (val.includes("تایید") || val.includes("Approved"))
            colorClass = "bg-blue-100 text-blue-700 border-blue-200";

          return (
            <Badge variant="outline" className={`font-normal ${colorClass}`}>
              {val}
            </Badge>
          );
        },
      },
    ],
    []
  );

  // --- هندلرها ---
  const handleCreate = () => {
    addTab("تعریف BOM جدید", "/product-engineering/boms/create");
  };

  const handleView = (row: BOMListDto) => {
    addTab(
      `فرمول ${row.productName}`,
      `/product-engineering/boms/view/${row.id}`
    );
  };

  const handleEdit = (row: BOMListDto) => {
    addTab(
      `ویرایش BOM ${row.version}`,
      `/product-engineering/boms/edit/${row.id}`
    );
  };

  const handleOpenCopyModal = (row: BOMListDto) => {
    setSelectedBOM(row);
    setCopyModalOpen(true);
  };

  const handleViewTree = (row: BOMListDto) => {
    addTab(
      `درخت ${row.productName}`,
      `/product-engineering/boms/tree/${row.id}`
    );
  };

  const handleDelete = async (row: BOMListDto) => {
    if (
      !confirm(
        `آیا از حذف فرمول نسخه ${row.version} برای محصول "${row.productName}" اطمینان دارید؟`
      )
    )
      return;

    try {
      await apiClient.delete(`/BOMs/${row.id}`);
      toast.success("فرمول با موفقیت حذف شد");
      refresh();
    } catch (error: any) {
      const msg = error.response?.data?.detail || "خطا در حذف اطلاعات.";
      toast.error(msg);
    }
  };

  // --- رندر دکمه‌های عملیات ---
  const renderRowActions = (row: BOMListDto) => {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleView(row)}
              >
                <Eye size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>مشاهده جزئیات</TooltipContent>
          </Tooltip>

          <PermissionGuard permission="ProductEngineering.BOM.Create">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => handleEdit(row)}
                >
                  <Pencil size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ویرایش</TooltipContent>
            </Tooltip>
          </PermissionGuard>

          <PermissionGuard permission="ProductEngineering.BOM.Create">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => handleOpenCopyModal(row)}
                >
                  <Copy size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ایجاد نسخه جدید</TooltipContent>
            </Tooltip>
          </PermissionGuard>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                onClick={() => handleViewTree(row)}
              >
                <Network size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>ساختار درختی</TooltipContent>
          </Tooltip>

          <PermissionGuard permission="ProductEngineering.BOM.Create">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(row)}
                >
                  <Trash2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>حذف</TooltipContent>
            </Tooltip>
          </PermissionGuard>
        </div>
      </TooltipProvider>
    );
  };

  const renderContextMenu = (row: BOMListDto, closeMenu: () => void) => {
    return (
      <>
        <DropdownMenuItem
          onClick={() => {
            handleView(row);
            closeMenu();
          }}
          className="gap-2 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span>مشاهده جزئیات</span>
        </DropdownMenuItem>

        <PermissionGuard permission="ProductEngineering.BOM.Create">
          <DropdownMenuItem
            onClick={() => {
              handleEdit(row);
              closeMenu();
            }}
            className="gap-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-emerald-600" />
            <span>ویرایش فرمول</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              handleOpenCopyModal(row);
              closeMenu();
            }}
            className="gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-orange-600" />
            <span>ایجاد نسخه جدید</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              handleViewTree(row);
              closeMenu();
            }}
            className="gap-2 cursor-pointer"
          >
            <Network className="w-4 h-4 text-purple-600" />
            <span>نمایش درختی</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              handleDelete(row);
              closeMenu();
            }}
            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف فرمول</span>
          </DropdownMenuItem>
        </PermissionGuard>
      </>
    );
  };

  // --- JSX استاندارد شده ---
  return (
    <ProtectedPage permission="ProductEngineering.BOM">
      <MasterDetailLayout
        title="مدیریت فرمول‌های ساخت" // عنوان کوتاه‌تر برای موبایل
        icon={Layers}
        // --- دکمه کاملاً ریسپانسیو (شبیه صفحه محصولات) ---
        actions={
          <PermissionGuard permission="ProductEngineering.BOM.Create">
            <Button
              onClick={handleCreate}
              size="sm"
              // در موبایل padding کم (px-2) برای آیکون، در دسکتاپ بیشتر
              className="h-9 gap-2 shadow-sm px-2 sm:px-4 bg-primary hover:bg-primary/90"
            >
              <Plus size={16} />
              {/* متن فقط در سایز sm به بالا دیده می‌شود */}
              <span className="hidden sm:inline">فرمول جدید</span>
            </Button>
          </PermissionGuard>
        }
      >
        <div className="page-content">
          <DataTable
            columns={columns}
            {...tableProps}
            onRowDoubleClick={(row) => handleView(row)}
            renderRowActions={renderRowActions}
            renderContextMenu={renderContextMenu}
          />
        </div>

        {selectedBOM && (
          <NewVersionDialog
            open={copyModalOpen}
            onClose={() => {
              setCopyModalOpen(false);
              refresh();
            }}
            sourceBomId={selectedBOM.id}
            sourceVersion={selectedBOM.version}
            productName={selectedBOM.productName}
          />
        )}
      </MasterDetailLayout>
    </ProtectedPage>
  );
}
