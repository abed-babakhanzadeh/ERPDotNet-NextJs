"use client";

import React, { useMemo } from "react";
import { Product, ColumnConfig } from "@/types";
import apiClient from "@/services/apiClient";
import { Box, Plus } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTabs } from "@/providers/TabsProvider"; // 1. اضافه کردن هوک تب
import { ImageIcon } from "lucide-react";

// آدرس بک‌اند را از env بخوانید یا هاردکد کنید (فعلا هاردکد برای مثال)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5249";

// --- تعریف Placeholder ها (بدون تغییر) ---
const PlaceholderWrapper: React.FC<{
  children: React.ReactNode;
  permission?: string;
  title?: string;
  icon?: any;
  actions?: React.ReactNode;
}> = ({ children }) => <div>{children}</div>;

const ProtectedPagePlaceholder = ProtectedPage || PlaceholderWrapper;
const PermissionGuardPlaceholder =
  PermissionGuard || (({ children }) => <>{children}</>);
const MasterDetailLayoutPlaceholder = MasterDetailLayout || PlaceholderWrapper;

export default function ProductsPage() {
  // 2. دریافت متد addTab
  const { addTab } = useTabs();

  // استفاده از هوک دیتا تیبل
  const { tableProps, refresh } = useServerDataTable<Product>({
    endpoint: "/Products/search",
    initialPageSize: 10,
  });

  // *نکته: تمام استیت‌های مربوط به مودال (createModalOpen, editingProduct) حذف شدند*

  // تعریف ستون‌ها
  const columns: ColumnConfig[] = useMemo(
    () => [
      // 1. ستون تصویر (با رندر کاستوم)
      {
        key: "imagePath",
        label: "تصویر",
        type: "string", // تایپ دیتای خام
        render: (value: any, row: Product) => {
          if (!value)
            return (
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <ImageIcon size={16} className="opacity-50" />
              </div>
            );
          return (
            <div className="w-10 h-10 rounded overflow-hidden border bg-white hover:scale-150 transition-transform cursor-pointer shadow-sm relative z-0 hover:z-50">
              <img
                src={`${BACKEND_URL}${value}`}
                alt={row.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          );
        },
      },
      { key: "code", label: "کد کالا", type: "string" },
      { key: "name", label: "نام کالا", type: "string" },
      { key: "unitName", label: "واحد", type: "string" },
      { key: "supplyType", label: "نوع تامین", type: "string" },
      // 2. ستون مشخصات فنی (Truncate شده)
      {
        key: "technicalSpec",
        label: "مشخصات",
        type: "string",
        render: (value) => (
          <span
            className="truncate max-w-[150px] block text-muted-foreground text-xs"
            title={value}
          >
            {value || "-"}
          </span>
        ),
      },
      // 3. واحدهای فرعی (فقط نمایش تعداد)
      {
        key: "conversions", // فرض بر اینکه در DTO این فیلد وجود دارد
        label: "فرعی",
        type: "string", // مهم نیست
        render: (_: any, row: Product) => {
          const count = row.conversions?.length || 0;
          return count > 0 ? (
            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
              {count} واحد
            </span>
          ) : (
            <span className="text-muted-foreground text-[10px]">-</span>
          );
        },
      },
    ],
    []
  );

  // 3. هندلر جدید برای دکمه "کالای جدید"
  const handleCreate = () => {
    addTab("تعریف کالای جدید", "/base-info/products/create");
  };

  // 4. هندلر جدید برای دکمه "ویرایش"
  const handleEdit = (row: Product) => {
    addTab(`ویرایش ${row.name}`, `/base-info/products/edit/${row.id}`);
  };

  // هندلر حذف (بدون تغییر)
  const handleDelete = async (row: Product) => {
    if (!confirm(`آیا از حذف کالای "${row.name}" اطمینان دارید؟`)) return;

    try {
      await apiClient.delete(`/Products/${row.id}`);
      toast.success("کالا با موفقیت حذف شد");
      refresh();
    } catch (error: any) {
      toast.error("خطا در حذف کالا. ممکن است در اسناد استفاده شده باشد.");
    }
  };

  return (
    <ProtectedPagePlaceholder permission="BaseInfo.Products">
      <MasterDetailLayoutPlaceholder
        title="مدیریت کالاها"
        icon={Box}
        actions={
          <PermissionGuardPlaceholder permission="BaseInfo.Products.Create">
            <button
              onClick={handleCreate} // اتصال به هندلر جدید
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm shadow-sm"
            >
              <Plus size={16} />
              کالای جدید
            </button>
          </PermissionGuardPlaceholder>
        }
      >
        <div className="page-content">
          <DataTable
            columns={columns}
            onEdit={(product) => handleEdit(product as Product)} // اتصال به هندلر جدید
            onDelete={handleDelete}
            {...tableProps}
          />
        </div>

        {/* نکته: کدهای مربوط به Modal کاملاً حذف شدند */}
      </MasterDetailLayoutPlaceholder>
    </ProtectedPagePlaceholder>
  );
}
