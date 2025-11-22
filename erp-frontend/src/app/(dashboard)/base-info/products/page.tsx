"use client";

import { useMemo, useState, useEffect } from "react";
// ایمپورت MRT_Row برای رفع خطای تایپ
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "mantine-react-table";
import { Product } from "@/types/product";
import apiClient from "@/services/apiClient";
import { Plus, Edit, Trash } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateProductForm from "./CreateProductForm";
import { useTabs } from "@/providers/TabsProvider";

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addTab } = useTabs();

  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = async () => {
    if (!data.length) setIsLoading(true);
    else setIsRefetching(true);

    try {
      const backendFilters = columnFilters.map((f) => ({
        propertyName: f.id,
        value: f.value,
        operation: "contains",
      }));

      const payload = {
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: globalFilter ?? "",
        sortColumn: sorting.length > 0 ? sorting[0].id : null,
        sortDescending: sorting.length > 0 ? sorting[0].desc : false,
        filters: backendFilters,
      };

      const { data: response } = await apiClient.post<any>(
        "/Products/search",
        payload
      );
      setData(response.items);
      setRowCount(response.totalCount);
      setIsError(false);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
    globalFilter,
  ]);

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "code",
        header: "کد کالا",
        size: 100,
        Cell: ({ renderedCellValue }) => (
          <span className="font-mono font-bold text-blue-600">
            {renderedCellValue}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "نام کالا",
        size: 250,
      },
      {
        accessorKey: "unitName",
        header: "واحد",
        size: 100,
      },
      {
        accessorKey: "supplyType",
        header: "نوع",
        size: 120,
        Cell: ({ cell }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs border ${
              cell.getValue() === "خریدنی"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-orange-50 text-orange-700 border-orange-200"
            }`}
          >
            {cell.getValue() as string}
          </span>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data,
    enableRowSelection: true,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    // === اصلاح مهم: استفاده از mantine...Props بجای mui...Props ===
    mantinePaperProps: {
      shadow: "none",
      style: { borderRadius: "12px", border: "1px solid #e5e7eb" },
    },
    mantineTableHeadCellProps: {
      style: { backgroundColor: "#f9fafb", fontWeight: "bold" },
    },

    enableRowActions: true,
    // === اصلاح مهم: تعریف تایپ row ===
    renderRowActions: ({ row }: { row: MRT_Row<Product> }) => (
      <div className="flex gap-2">
        <button onClick={() => alert("Edit")} className="text-blue-600">
          <Edit size={16} />
        </button>
        <button className="text-red-600">
          <Trash size={16} />
        </button>
      </div>
    ),

    mantineTableBodyRowProps: ({ row }) => ({
      onDoubleClick: () => {
        addTab(
          `کالا: ${row.original.name}`,
          `/base-info/products/${row.original.id}`
        );
      },
      className: "cursor-pointer hover:bg-blue-50 transition-colors",
    }),

    renderTopToolbarCustomActions: () => (
      <PermissionGuard permission="BaseInfo.Products.Create">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          <Plus size={16} />
          کالای جدید
        </button>
      </PermissionGuard>
    ),
  });

  return (
    <ProtectedPage permission="BaseInfo.Products">
      <div className="p-2">
        <MantineReactTable table={table} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="تعریف کالای جدید"
      >
        <CreateProductForm
          onCancel={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }}
        />
      </Modal>
    </ProtectedPage>
  );
}
