"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { BOM } from '@/types/bom'; // تایپی که ساختیم
import { SortConfig, ColumnConfig, ColumnFilter as AdvancedColumnFilter } from '@/types';
import apiClient from '@/services/apiClient';
import { Layers, Plus } from 'lucide-react';

// کامپوننت‌های UI شما
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";

import CreateBOMForm from "./CreateBOMForm";

// رپرهای اجباری برای جلوگیری از خطای بیلد در صورت نبود کامپوننت‌ها
const PlaceholderWrapper: React.FC<{ children: React.ReactNode, permission?: string, title?: string, icon?: any, actions?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
const ProtectedPagePlaceholder = ProtectedPage || PlaceholderWrapper;
const PermissionGuardPlaceholder = PermissionGuard || (({ children }) => <>{children}</>);
const MasterDetailLayoutPlaceholder = MasterDetailLayout || PlaceholderWrapper;

export default function BOMPage() {
  const router = useRouter();

  // --- State ---
  const [data, setData] = useState<BOM[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);

  // فیلتر و سورت
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortConfig>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedColumnFilter[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // مودال‌ها
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // --- دریافت اطلاعات از API ---
  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      // 1. آماده‌سازی فیلترهای پیشرفته
      const advancedFilterPayload = advancedFilters.flatMap(f =>
        f.conditions
          .filter(c => c.value !== '' && c.value !== null)
          .map(c => ({
            PropertyName: f.key, // مثلاً "productName"
            Operation: c.operator,
            Value: String(c.value)
          }))
      );

      // 2. آماده‌سازی فیلترهای ساده
      const simpleColumnFiltersPayload = Object.entries(columnFilters)
        .filter(([, value]) => value)
        .map(([key, value]) => ({
          PropertyName: key,
          Operation: 'contains',
          Value: String(value)
        }));

      // 3. ترکیب فیلترها
      const allFiltersForApi = [...advancedFilterPayload, ...simpleColumnFiltersPayload];

      const payload = {
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: globalFilter ?? "",
        sortColumn: sorting?.key || "id",
        sortDescending: sorting?.direction === 'descending',
        Filters: allFiltersForApi // دقیقاً مطابق GetBOMsListQuery
      };

      const { data: response } = await apiClient.post<any>("/BOMs/search", payload);
      
      if (response && response.items) {
        setData(response.items);
        setRowCount(response.totalCount);
      } else {
        setData([]);
        setRowCount(0);
      }
    } catch (error) {
      setIsError(true);
      console.error("Fetch error:", error);
      toast.error("خطا در دریافت لیست BOM ها.");
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // رفرش با تغییر وضعیت‌ها
  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter, advancedFilters, columnFilters]);

  // --- تعریف ستون‌ها ---
  // کلیدها (key) باید دقیقاً با نام پراپرتی‌های BOMListDto در بک‌اند یکی باشند
  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "productCode", label: "کد محصول", type: 'string' },
      { key: "productName", label: "نام محصول", type: 'string' },
      { key: "title", label: "عنوان فرمول", type: 'string' },
      { key: "version", label: "نسخه", type: 'string' },
      { key: "type", label: "نوع", type: 'string' },    // از Enum.ToDisplay() می‌آید
      { key: "status", label: "وضعیت", type: 'string' }, // از Enum.ToDisplay() می‌آید
      { key: "isActive", label: "فعال", type: 'boolean' },
    ],
    [],
  );

  // --- هندلرها ---

  // عملیات ویرایش: هدایت به صفحه جزئیات BOM
  const handleEdit = (row: BOM) => {
     router.push(`/product-engineering/boms/${row.id}`);
  };

  // عملیات حذف
  const handleDelete = async (row: BOM) => {
    if (!confirm(`آیا از حذف فرمول "${row.title}" اطمینان دارید؟`)) return;

    try {
      // توجه: متد Delete در کنترلر شما هنوز پیاده‌سازی نشده بود، فرض بر این است که اضافه می‌شود
      // await apiClient.delete(`/BOMs/${row.id}`);
      toast.info("قابلیت حذف باید در API پیاده‌سازی شود.");
      // fetchData();
    } catch (error: any) {
      toast.error("خطا در حذف.");
    }
  };

  // مدیریت فیلترهای جدول (کپی شده از پیاده‌سازی صحیح شما)
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
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const pageCount = Math.ceil(rowCount / pagination.pageSize);

  return (
    <ProtectedPagePlaceholder permission="ProductEngineering.BOM">
      <MasterDetailLayoutPlaceholder
        title="مدیریت مهندسی محصول (BOM)"
        icon={Layers}
        actions={
          <PermissionGuardPlaceholder permission="ProductEngineering.BOM.Create">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition text-sm shadow-sm"
            >
              <Plus size={16} />
              فرمول جدید
            </button>
          </PermissionGuardPlaceholder>
        }
      >
        <div className="p-4 h-full">
          <DataTable
            columns={columns}
            data={data}
            rowCount={rowCount}
            pageCount={pageCount}
            pagination={pagination}
            sortConfig={sorting}
            globalFilter={globalFilter}
            advancedFilters={advancedFilters}
            columnFilters={columnFilters}
            isLoading={isLoading}
            
            // اتصال هندلرها
            onGlobalFilterChange={setGlobalFilter}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            onColumnFilterChange={handleColumnFilterChange}
            onClearAllFilters={handleClearAllFilters}
            onPaginationChange={setPagination}
            onSortChange={setSorting}
            
            // اکشن‌ها
            onEdit={(bom) => handleEdit(bom as BOM)}
            onDelete={(bom) => handleDelete(bom as BOM)}
          />
        </div>

        {createModalOpen && (
          <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="ایجاد BOM جدید">
            <CreateBOMForm
              onCancel={() => setCreateModalOpen(false)}
              onSuccess={() => {
                setCreateModalOpen(false);
                fetchData();
              }}
            />
          </Modal>
        )}

      </MasterDetailLayoutPlaceholder>
    </ProtectedPagePlaceholder>
  );
}