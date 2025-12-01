"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Product, SortConfig, ColumnConfig, ColumnFilter as AdvancedColumnFilter } from '@/types';
import apiClient from '@/services/apiClient';
import { Box, Plus } from 'lucide-react';
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateProductForm from "./CreateProductForm";
import EditProductForm from "./EditProductForm";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";

const PlaceholderWrapper: React.FC<{ children: React.ReactNode, permission?: string, title?: string, icon?: any, actions?: React.ReactNode }> = ({ children }) => <div>{children}</div>;

const ProtectedPagePlaceholder = ProtectedPage || PlaceholderWrapper;
const PermissionGuardPlaceholder = PermissionGuard || (({ children }) => <>{children}</>);
const MasterDetailLayoutPlaceholder = MasterDetailLayout || PlaceholderWrapper;


export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rowCount, setRowCount] = useState(0);

  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortConfig>(null);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedColumnFilter[]>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const advancedFilterPayload = advancedFilters.flatMap(f =>
        f.conditions
          .filter(c => c.value !== '' && c.value !== null)
          .map(c => ({
            PropertyName: f.key,
            Operation: c.operator,
            Value: String(c.value)
          }))
      );

      const simpleColumnFiltersPayload = Object.entries(columnFilters)
        .filter(([, value]) => value)
        .map(([key, value]) => ({
          PropertyName: key,
          Operation: 'contains',
          Value: String(value)
        }));

      const allFiltersForApi = [...advancedFilterPayload, ...simpleColumnFiltersPayload];

      const payload = {
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: globalFilter ?? "",
        sortColumn: sorting?.key,
        sortDescending: sorting?.direction === 'descending',
        Filters: allFiltersForApi
      };

      const response = await apiClient.post<any>("/Products/search", payload);
      
      if (response && response.data && response.data.items) {
        setData(response.data.items);
        setRowCount(response.data.totalCount);
      } else {
        setData([]);
        setRowCount(0);
        toast.error("پاسخ دریافتی از سرور ساختار نامعتبر دارد.");
      }
    } catch (error) {
      setIsError(true);
      console.error("Fetch data error:", error);
      toast.error("خطا در ارتباط با سرور هنگام دریافت اطلاعات کالاها.");
      setData([]);
      setRowCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter, advancedFilters, columnFilters]);

  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "code", label: "کد کالا", type: 'string' },
      { key: "name", label: "نام کالا", type: 'string' },
      { key: "unitName", label: "واحد", type: 'string' },
      { key: "supplyType", label: "نوع تامین", type: 'string' },
    ],
    [],
  );

  const handleDelete = async (row: Product) => {
    if (!confirm(`آیا از حذف کالای "${row.name}" اطمینان دارید؟`)) return;

    try {
      await apiClient.delete(`/Products/${row.id}`);
      toast.success("کالا با موفقیت حذف شد");
      fetchData();
    } catch (error: any) {
      toast.error("خطا در حذف کالا. ممکن است در اسناد استفاده شده باشد.");
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
    setPagination(p => ({ ...p, pageIndex: 0 }));
  };

  const pageCount = Math.ceil(rowCount / pagination.pageSize);

  return (
    <ProtectedPagePlaceholder permission="BaseInfo.Products">
      <MasterDetailLayoutPlaceholder
        title="مدیریت کالاها"
        icon={Box}
        actions={
          <PermissionGuardPlaceholder permission="BaseInfo.Products.Create">
            <button
              onClick={() => setCreateModalOpen(true)}
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
            data={data}
            rowCount={rowCount}
            pageCount={pageCount}
            pagination={pagination}
            sortConfig={sorting}
            globalFilter={globalFilter}
            advancedFilters={advancedFilters}
            columnFilters={columnFilters}
            isLoading={isLoading}
            onGlobalFilterChange={setGlobalFilter}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            onColumnFilterChange={handleColumnFilterChange}
            onClearAllFilters={handleClearAllFilters}
            onPaginationChange={setPagination}
            onSortChange={setSorting}
            onEdit={(product) => setEditingProduct(product as Product)}
            onDelete={handleDelete}
          />
        </div>

        {createModalOpen && (
          <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="تعریف کالای جدید">
            <CreateProductForm
              onCancel={() => setCreateModalOpen(false)}
              onSuccess={() => {
                setCreateModalOpen(false);
                toast.success("کالای جدید با موفقیت ایجاد شد.");
                fetchData();
              }}
            />
          </Modal>
        )}

        {editingProduct && (
          <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title={`ویرایش کالا: ${editingProduct.name}`}>
            <EditProductForm
              product={editingProduct}
              onCancel={() => setEditingProduct(null)}
              onSuccess={() => {
                setEditingProduct(null);
                toast.success("تغییرات با موفقیت ذخیره شد.");
                fetchData();
              }}
            />
          </Modal>
        )}
      </MasterDetailLayoutPlaceholder>
    </ProtectedPagePlaceholder>
  );
}
