"use client";

import React, { useMemo } from "react";
import { Unit, ColumnConfig } from "@/types";
import apiClient from "@/services/apiClient";
import { Plus, Ruler } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useTabs } from "@/providers/TabsProvider";
import { Badge } from "@/components/ui/badge";
import { useTabPrefetch } from "@/hooks/useTabPrefetch";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export default function UnitsPage() {
  const { addTab } = useTabs();

  useTabPrefetch(["/base-info/units/create"]);

  const { tableProps, refresh } = useServerDataTable<Unit>({
    endpoint: "/Units/search",
    initialPageSize: 30,
  });

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

  const handleCreate = () => {
    addTab("تعریف واحد جدید", "/base-info/units/create");
  };

  const handleEdit = (row: Unit) => {
    addTab(`ویرایش ${row.title}`, `/base-info/units/edit/${row.id}`);
  };

  return (
    <ProtectedPagePlaceholder permission="BaseInfo.Units">
      <div className="flex flex-col h-full bg-background">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-gradient-to-l from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 backdrop-blur supports-[backdrop-filter]:bg-card/90 px-4 py-2.5 shadow-sm h-12">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="flex items-center justify-between h-8 mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" />
                <h1 className="text-sm font-semibold">مدیریت واحدها</h1>
              </div>
            </div>
          </div>
          <PermissionGuardPlaceholder permission="BaseInfo.Units.Create">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCreate}
                    size="sm"
                    className="h-7 gap-1.5 md:gap-2"
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline text-xs">واحد جدید</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px] sm:hidden">
                  واحد جدید
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PermissionGuardPlaceholder>
        </div>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            onEdit={(unit) => handleEdit(unit as Unit)}
            onDelete={handleDelete}
            {...tableProps}
          />
        </div>
      </div>
    </ProtectedPagePlaceholder>
  );
}
