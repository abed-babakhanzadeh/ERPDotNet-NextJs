"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Unit, ColumnConfig, SortConfig } from '@/types'; 
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
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  
  // State های جدول برای فیلتر و سورت سرور ساید
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortConfig>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // استیت برای مدیریت مودال‌ها
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // فراخوانی API
  const fetchData = async () => {
    if (!data.length) setIsLoading(true);
    else setIsRefetching(true);

    try {
      // در پروژه واقعی شما، اینجا باید فیلترهای پیشرفته را نیز به payload اضافه کنید.
      const payload = {
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: globalFilter ?? "",
        sortColumn: sorting?.key,
        sortDescending: sorting?.direction === 'descending',
        filters: [] // شما باید این را بر اساس state فیلترهای پیشرفته خود پر کنید
      };

      const { data: response } = await apiClient.post<any>("/Units/search", payload);
      setData(response.items);
      setRowCount(response.totalCount);
      setIsError(false);
    } catch (error) {
      setIsError(true);
      console.error(error);
      toast.error("خطا در دریافت اطلاعات از سرور");
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  // تعریف ستون‌ها با ساختار جدید
  const columns: ColumnConfig[] = useMemo(
    () => [
      { key: "title", label: "عنوان واحد", type: 'string' },
      { key: "symbol", label: "نماد", type: 'string' },
      { 
        key: "baseUnitName", 
        label: "رابطه (ضریب)", 
        type: 'string',
        // Cell: ({ row }) => row.original.baseUnitName ? ( ... ) : ( ... ) // Custom cell example
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
         <div className="p-4 h-full">
            <DataTable
                columns={columns}
                data={data}
                
                // اتصال State ها به کامپوننت جدید
                rowCount={rowCount}
                pageCount={pageCount}
                pagination={pagination}
                sortConfig={sorting}
                globalFilter={globalFilter}
                isLoading={isLoading || isRefetching}

                // اتصال Event Handler ها
                onGlobalFilterChange={setGlobalFilter}
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

// کامپوننت‌های Placeholder برای جلوگیری از خطا
if (!apiClient) {
    const apiClient = {
        post: async () => ({ data: { items: [], totalCount: 0 } }),
        delete: async () => ({})
    };
}
if (!Modal) {
    const Modal: React.FC<any> = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, direction: 'rtl' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                    <h2>{title}</h2>
                    {children}
                    <button onClick={onClose}>بستن</button>
                </div>
            </div>
        );
    };
}
