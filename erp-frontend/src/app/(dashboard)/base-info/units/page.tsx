"use client";

import { useMemo, useState, useEffect } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "mantine-react-table";
import { Unit } from "@/types/baseInfo";
import apiClient from "@/services/apiClient";
import { Ruler, Plus, Edit, Trash } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateUnitForm from "./CreateUnitForm";
import MasterDetailLayout from "@/components/ui/MasterDetailLayout";
import { toast } from "sonner";

export default function UnitsPage() {
  const [data, setData] = useState<Unit[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State های جدول
  const [columnFilters, setColumnFilters] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // فراخوانی API
  const fetchData = async () => {
    if (!data.length) setIsLoading(true);
    else setIsRefetching(true);

    try {
      // تبدیل فیلترها
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
        "/Units/search",
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

  // تعریف ستون‌ها
  const columns = useMemo<MRT_ColumnDef<Unit>[]>(
    () => [
      {
        accessorKey: "title",
        header: "عنوان واحد",
        size: 150,
        Cell: ({ renderedCellValue }) => (
          <span className="font-medium text-gray-900">{renderedCellValue}</span>
        ),
      },
      {
        accessorKey: "symbol",
        header: "نماد",
        size: 100,
        Cell: ({ renderedCellValue }) => (
          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
            {renderedCellValue}
          </span>
        ),
      },
      {
        accessorKey: "baseUnitName", // برای سورت سمت سرور
        header: "رابطه (ضریب)",
        size: 200,
        // سلول سفارشی برای نمایش فرمول
        Cell: ({ row }) =>
          row.original.baseUnitName ? (
            <span className="text-gray-600 text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
              1 {row.original.title} = <b>{row.original.conversionFactor}</b>{" "}
              {row.original.baseUnitName}
            </span>
          ) : (
            <span className="text-gray-400 text-xs italic">
              واحد مبنا (اصلی)
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
    // استایل ظاهری (رفع خطای muiTablePaperProps)
    mantinePaperProps: {
      shadow: "none",
      style: { borderRadius: "0", border: "none" },
    },
    mantineTableHeadCellProps: {
      style: {
        backgroundColor: "#f9fafb",
        fontWeight: "bold",
        color: "#374151",
      },
    },
    // اکشن‌ها
    enableRowActions: true,
    renderRowActions: ({ row }: { row: MRT_Row<Unit> }) => (
      <div className="flex gap-2">
        <PermissionGuard permission="BaseInfo.Units.Edit">
          <button
            onClick={() => alert("ویرایش")}
            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
          >
            <Edit size={18} />
          </button>
        </PermissionGuard>
        <PermissionGuard permission="BaseInfo.Units.Delete">
          <button
            onClick={() => toast.info("حذف به زودی...")}
            className="text-red-600 hover:bg-red-50 p-1 rounded"
          >
            <Trash size={18} />
          </button>
        </PermissionGuard>
      </div>
    ),
    renderTopToolbarCustomActions: () => (
      <PermissionGuard permission="BaseInfo.Units.Create">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          <Plus size={16} />
          واحد جدید
        </button>
      </PermissionGuard>
    ),
  });

  return (
    <ProtectedPage permission="BaseInfo.Units">
      <MasterDetailLayout
        title="مدیریت واحدهای سنجش"
        icon={Ruler}
        actions={null}
      >
        <div className="p-2">
          <MantineReactTable table={table} />
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="تعریف واحد سنجش"
        >
          <CreateUnitForm
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchData();
            }}
          />
        </Modal>
      </MasterDetailLayout>
    </ProtectedPage>
  );
}
