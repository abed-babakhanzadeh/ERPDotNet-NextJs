"use client";

import React, { useMemo, useState } from "react";
import { ColumnConfig } from "@/types";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Layers, Plus, Eye, Pencil, Copy, Trash2 } from "lucide-react";

// Components
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
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
import { Network } from "lucide-react";

// رابط داده‌ای که از GetBOMsListQuery میاد
interface BOMListDto {
  id: number;
  productName: string;
  productCode: string;
  version: string;
  title: string;
  type: string;
  status: string;
  isActive: boolean;
}

export default function BOMsListPage() {
  const { addTab } = useTabs();

  // استیت‌های مودال کپی
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMListDto | null>(null);

  // Prefetch کردن صفحه ایجاد
  useTabPrefetch(["/product-engineering/boms/create"]);

  // اتصال به کوئری
  const { tableProps, refresh } = useServerDataTable<BOMListDto>({
    endpoint: "/BOMs/search",
    initialPageSize: 10,
  });

  // --- تعریف ستون‌ها ---
  const columns: ColumnConfig[] = useMemo(
    () => [
      {
        key: "productCode",
        label: "کد محصول",
        type: "string",
      },
      {
        key: "productName",
        label: "نام محصول",
        type: "string",
        render: (val, row: BOMListDto) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{val}</span>
            <span className="text-[10px] text-muted-foreground">
              {row.title}
            </span>
          </div>
        ),
      },
      {
        key: "version",
        label: "نسخه",
        type: "string",
        render: (val) => (
          <Badge
            variant="outline"
            className="dir-ltr font-mono bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            v{val}
          </Badge>
        ),
      },
      {
        key: "type",
        label: "نوع فرمول",
        type: "string",
        render: (val) => <span className="text-xs">{val}</span>,
      },
      {
        key: "status",
        label: "وضعیت",
        type: "string",
        render: (val, row: BOMListDto) => {
          let colorClass = "bg-gray-100 text-gray-700 border-gray-200";

          if (val.includes("فعال") || val.includes("Active"))
            colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
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

  // --- رندر اکشن‌های ستون (آیکون‌ها) ---
  const renderRowActions = (row: BOMListDto) => {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1">
          {/* مشاهده */}
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

          {/* ویرایش */}
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

          {/* نسخه جدید */}
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

          {/* دکمه درخت - بنفش */}
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

          {/* حذف */}
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

  // --- رندر منوی راست کلیک ---
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
            <span>نمایش درختی (Explosion)</span>
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

  return (
    <ProtectedPage permission="ProductEngineering.BOM">
      <MasterDetailLayout
        title="مدیریت فرمول‌های ساخت (BOM)"
        icon={Layers}
        actions={
          <PermissionGuard permission="ProductEngineering.BOM.Create">
            <Button onClick={handleCreate} className="h-9 gap-2 shadow-sm">
              <Plus size={16} />
              فرمول جدید
            </Button>
          </PermissionGuard>
        }
      >
        <div className="page-content">
          <DataTable
            columns={columns}
            {...tableProps}
            renderRowActions={renderRowActions}
            renderContextMenu={renderContextMenu}
          />
        </div>

        {selectedBOM && (
          <NewVersionDialog
            open={copyModalOpen}
            onClose={() => {
              setCopyModalOpen(false);
              refresh(); // رفرش لیست بعد از موفقیت
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
