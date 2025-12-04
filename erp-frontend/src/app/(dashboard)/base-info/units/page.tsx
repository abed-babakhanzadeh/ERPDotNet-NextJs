"use client";

import React, { useMemo } from "react";
import { Unit, ColumnConfig } from "@/types";
import apiClient from "@/services/apiClient";
import { Ruler, Plus, Check, X } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTabs } from "@/providers/TabsProvider";
import { Badge } from "@/components/ui/badge";
import { useTabPrefetch } from "@/hooks/useTabPrefetch";

// --- تعریف Placeholder ها ---
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

export default function UnitsPage() {
  const { addTab } = useTabs();

  // prefetch عمومی برای فرم ایجاد واحد
  useTabPrefetch(["/base-info/units/create"]);

  const { tableProps, refresh } = useServerDataTable<Unit>({
    endpoint: "/Units/search",
    initialPageSize: 10,
  });

  // تعریف ستون‌ها با رندر صحیح
  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "title", label: "عنوان واحد", type: "string" },
      { key: "symbol", label: "نماد", type: "string" },
      {
        key: "baseUnitName",
        label: "واحد پایه",
        type: "string",
        render: (value) =>
          value || <span className="text-muted-foreground text-xs">-</span>,
      },
      {
        key: "conversionFactor",
        label: "ضریب",
        type: "number",
        render: (value, row) =>
          row.baseUnitName ? (
            value
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          ),
      },
      {
        key: "isActive",
        label: "وضعیت",
        type: "boolean",
        render: (val) =>
          val ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">فعال</Badge>
          ) : (
            <Badge variant="destructive">غیرفعال</Badge>
          ),
      },
    ],
    []
  );

  // هندلر حذف
  const handleDelete = async (row: Unit) => {
    if (!confirm(`آیا از حذف واحد "${row.title}" اطمینان دارید؟`)) return;
    try {
      await apiClient.delete(`/Units/${row.id}`);
      toast.success("واحد با موفقیت حذف شد");
      refresh();
    } catch (error: any) {
      toast.error("خطا در حذف واحد. ممکن است در کالاها استفاده شده باشد.");
    }
  };

  // هندلر ایجاد
  const handleCreate = () => {
    addTab("تعریف واحد جدید", "/base-info/units/create");
  };

  // هندلر ویرایش
  const handleEdit = (row: Unit) => {
    addTab(`جزئیات واحد: ${row.title}`, `/base-info/units/edit/${row.id}`);
  };

  return (
    <ProtectedPagePlaceholder permission="BaseInfo.Units">
      <MasterDetailLayoutPlaceholder
        title="مدیریت واحدهای سنجش"
        icon={Ruler}
        actions={
          <PermissionGuardPlaceholder permission="BaseInfo.Units.Create">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm shadow-sm"
            >
              <Plus size={16} />
              واحد جدید
            </button>
          </PermissionGuardPlaceholder>
        }
      >
        <div className="page-content">
          <DataTable
            columns={columns}
            onEdit={(unit) => handleEdit(unit as Unit)}
            onDelete={handleDelete}
            {...tableProps}
          />
        </div>
      </MasterDetailLayoutPlaceholder>
    </ProtectedPagePlaceholder>
  );
}
