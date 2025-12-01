"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Unit, ColumnConfig, SortConfig, ColumnFilter as AdvancedColumnFilter } from '@/types';
import apiClient from '@/services/apiClient';
import { Ruler, Plus } from 'lucide-react';
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateUnitForm from "./CreateUnitForm";
import EditUnitForm from "./EditUnitForm";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";

// کامپوننت‌های Placeholder برای کامپوننت‌های پروژه شما
const PlaceholderWrapper: React.FC<{ children: React.ReactNode, permission?: string, title?: string, icon?: any, actions?: React.ReactNode }> = ({ children }) => <div>{children}</div>;

// اگر این کامپوننت‌ها در پروژه شما موجود نیستند، باید آنها را ایجاد کنید یا با کامپوننت‌های خودتان جایگزین کنید.
const ProtectedPagePlaceholder = ProtectedPage || PlaceholderWrapper;
const PermissionGuardPlaceholder = PermissionGuard || (({ children }) => <>{children}</>);
const MasterDetailLayoutPlaceholder = MasterDetailLayout || PlaceholderWrapper;


export default function UnitsPage() {
  const [data, setData] = useState<Unit[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const [rowCount, setRowCount] = useState(0);

  // State های جدول برای فیلتر و سورت سرور ساید
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortConfig>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedColumnFilter[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // استیت برای مدیریت مودال‌ها
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // فراخوانی API
  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // 1. تبدیل فیلترهای پیشرفته
      const advancedFilterPayload = advancedFilters.flatMap(f => 
        f.conditions
          .filter(c => c.value !== '' && c.value !== null) // فقط شرط‌های دارای مقدار
          .map(c => ({
            PropertyName: f.key,
            Operation: c.operator,
            Value: String(c.value) // اطمینان از اینکه مقدار رشته است
            // value2 and logic are not supported by the backend
          }))
      );

      // 2. تبدیل فیلترهای ساده ستون‌ها
      const simpleColumnFiltersPayload = Object.entries(columnFilters)
        .filter(([, value]) => value) // فقط فیلترهای دارای مقدار
        .map(([key, value]) => ({
          PropertyName: key,
          Operation: 'contains', // یا هر عملگر پیش‌فرض دیگری
          Value: String(value)
        }));
        
      // 3. ترکیب همه فیلترها
      const allFiltersForApi = [...advancedFilterPayload, ...simpleColumnFiltersPayload];

      const payload = {
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: globalFilter ?? "",
        sortColumn: sorting?.key,
        sortDescending: sorting?.direction === 'descending',
        Filters: allFiltersForApi // نام پراپرتی باید Filters باشد (با حرف بزرگ)
      };

      const { data: response } = await apiClient.post<any>("/Units/search", payload);
      
      if (response && response.items) {
        setData(response.items);
        setRowCount(response.totalCount);
      } else {
        setData([]);
        setRowCount(0);
      }
    } catch (error) {
      setIsError(true);
      console.error("Fetch data error:", error);
      toast.error("خطا در ارتباط با سرور هنگام دریافت اطلاعات.");
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter, advancedFilters, columnFilters]);

  // تعریف ستون‌ها با ساختار جدید
  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "title", label: "عنوان واحد", type: 'string' },
      { key: "symbol", label: "نماد", type: 'string' },
      {
        key: "baseUnitName",
        label: "رابطه (ضریب)",
        type: 'string',
      },
      { key: "isActive", label: "وضعیت", type: 'boolean' },
    ],
    [],
  );

  // هندلر حذف
  const handleDelete = async (row: Unit) => {
      if(!confirm(`آیا از حذف واحد "${row.title}" اطمینان دارید؟`)) return;

      try {
          await apiClient.delete(`/Units/${row.id}`);
          toast.success("واحد با موفقیت حذف شد");
          fetchData(); // رفرش گرید
      } catch (error: any) {
          toast.error("خطا در حذف واحد. ممکن است در کالاها استفاده شده باشد.");
      }
  };

  const handleAdvancedFilterChange = (newFilter: AdvancedColumnFilter | null) => {
    setPagination(p => ({ ...p, pageIndex: 0 }));
    setAdvancedFilters(prev => {
        if (!newFilter) return prev; 
        const otherFilters = prev.filter(f => f.key !== newFilter.key);
        if (newFilter.conditions.some(c => c.value !== '' && c.value !== null)) {
            return [...otherFilters, newFilter];
        }
        return otherFilters;
    });
  };
  

  const handleColumnFilterChange = (key: string, value: string) => {
    setPagination(p => ({ ...p, pageIndex: 0 }));
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearAllFilters = () => {
    setGlobalFilter("");
    setAdvancedFilters([]);
    setColumnFilters({});
    setPagination(p => ({...p, pageIndex: 0}));
  }

  const pageCount = Math.ceil(rowCount / pagination.pageSize);

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
            <DataTable
                columns={columns}
                data={data}

                // اتصال State ها به کامپوننت جدید
                rowCount={rowCount}
                pageCount={pageCount}
                pagination={pagination}
                sortConfig={sorting}
                globalFilter={globalFilter}
                advancedFilters={advancedFilters}
                columnFilters={columnFilters}
                isLoading={isLoading}

                // اتصال Event Handler ها
                onGlobalFilterChange={setGlobalFilter}
                onAdvancedFilterChange={handleAdvancedFilterChange}
                onColumnFilterChange={handleColumnFilterChange}
                onClearAllFilters={handleClearAllFilters}
                onPaginationChange={setPagination}
                onSortChange={setSorting}

                // عملیات روی ردیف‌ها
                onEdit={(unit) => setEditingUnit(unit as Unit)}
                onDelete={handleDelete}
            />
         </div>

         {/* مودال ایجاد */}
         {createModalOpen && (
           <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="تعریف واحد سنجش">
              <CreateUnitForm
                  onCancel={() => setCreateModalOpen(false)}
                  onSuccess={() => {
                      setCreateModalOpen(false);
                      toast.success("واحد جدید با موفقیت ایجاد شد");
                      fetchData();
                  }}
              />
          </Modal>
         )}

        {/* مودال ویرایش */}
        {editingUnit && (
            <Modal isOpen={!!editingUnit} onClose={() => setEditingUnit(null)} title={`ویرایش واحد ${editingUnit.title}`}>
                <EditUnitForm
                    unit={editingUnit}
                    onCancel={() => setEditingUnit(null)}
                    onSuccess={() => {
                        setEditingUnit(null);
                        toast.success("تغییرات با موفقیت ذخیره شد");
                        fetchData();
                    }}
                />
            </Modal>
        )}
      </MasterDetailLayoutPlaceholder>
    </ProtectedPagePlaceholder>
  );
}
