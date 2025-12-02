"use client";

import React, { useState, useMemo } from "react";
import { Unit, ColumnConfig } from "@/types";
import apiClient from "@/services/apiClient";
import { Ruler, Plus } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateUnitForm from "./CreateUnitForm";
import EditUnitForm from "./EditUnitForm";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
// 1. ایمپورت هوک اختصاصی
import { useServerDataTable } from "@/hooks/useServerDataTable";

// --- تعریف Placeholder ها (دقیقاً مثل قبل) ---
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
  // 2. استفاده از هوک برای مدیریت تمام لاجیک جدول (فچ، فیلتر، پیجینیشن)
  const { tableProps, refresh } = useServerDataTable<Unit>({
    endpoint: "/Units/search", // آدرس اندپوینت مربوط به واحدها
    initialPageSize: 10,
  });

  // 3. استیت‌های مربوط به UI (فقط مودال‌ها باقی می‌مانند)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // 4. تعریف ستون‌ها (ثابت)
  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "title", label: "عنوان واحد", type: "string" },
      { key: "symbol", label: "نماد", type: "string" },
      { key: "baseUnitName", label: "رابطه (ضریب)", type: "string" },
      { key: "isActive", label: "وضعیت", type: "boolean" },
    ],
    []
  );

  // 5. هندلر حذف (با استفاده از رفرش هوک)
  const handleDelete = async (row: Unit) => {
    if (!confirm(`آیا از حذف واحد "${row.title}" اطمینان دارید؟`)) return;

    try {
      await apiClient.delete(`/Units/${row.id}`);
      toast.success("واحد با موفقیت حذف شد");
      refresh(); // <--- رفرش کردن جدول از طریق هوک
    } catch (error: any) {
      toast.error("خطا در حذف واحد. ممکن است در کالاها استفاده شده باشد.");
    }
  };

  return (
    <ProtectedPagePlaceholder permission="BaseInfo.Units">
      <MasterDetailLayoutPlaceholder
        title="مدیریت واحدهای سنجش"
        icon={Ruler}
        actions={
          <PermissionGuardPlaceholder permission="BaseInfo.Units.Create">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm shadow-sm"
            >
              <Plus size={16} />
              واحد جدید
            </button>
          </PermissionGuardPlaceholder>
        }
      >
        <div className="page-content">
          {/* 6. استفاده از DataTable با پخش کردن پراپ‌های هوک */}
          <DataTable
            columns={columns}
            onEdit={(unit) => setEditingUnit(unit as Unit)}
            onDelete={handleDelete}
            {...tableProps} // تزریق خودکار data, pagination, loading, handlers و ...
          />
        </div>

        {/* مودال ایجاد */}
        {createModalOpen && (
          <Modal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            title="تعریف واحد سنجش"
          >
            <CreateUnitForm
              onCancel={() => setCreateModalOpen(false)}
              onSuccess={() => {
                setCreateModalOpen(false);
                toast.success("واحد جدید با موفقیت ایجاد شد");
                refresh(); // رفرش لیست
              }}
            />
          </Modal>
        )}

        {/* مودال ویرایش */}
        {editingUnit && (
          <Modal
            isOpen={!!editingUnit}
            onClose={() => setEditingUnit(null)}
            title={`ویرایش واحد ${editingUnit.title}`}
          >
            <EditUnitForm
              unit={editingUnit}
              onCancel={() => setEditingUnit(null)}
              onSuccess={() => {
                setEditingUnit(null);
                toast.success("تغییرات با موفقیت ذخیره شد");
                refresh(); // رفرش لیست
              }}
            />
          </Modal>
        )}
      </MasterDetailLayoutPlaceholder>
    </ProtectedPagePlaceholder>
  );
}
