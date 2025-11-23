"use client";

import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_TableOptions,
} from 'mantine-react-table';
import { MRT_Localization_FA } from "@/config/mrt-fa"; // فایل ترجمه که قبلا ساختیم
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// تعریف Props که ما نیاز داریم (ساده شده‌ی Props اصلی)
interface ERPGridProps<TData extends MRT_RowData> extends MRT_TableOptions<TData> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
}

export default function ERPGrid<TData extends MRT_RowData>(props: ERPGridProps<TData>) {
  
const table = useMantineReactTable({
    ...props,
    
    // 1. فارسی سازی
    localization: MRT_Localization_FA,
    
    // 2. تنظیمات ظاهری (استایل راهکاران + راست‌چین اجباری)
    mantinePaperProps: {
      shadow: 'none',
      style: { borderRadius: '0', border: 'none' },
      ...props.mantinePaperProps,
    },
    
    // --- اصلاح هدرها ---
    mantineTableHeadCellProps: {
      align: 'right',
      className: 'text-right font-bold text-gray-700 bg-gray-50', // کلاس‌های تیلویند
      sx: {
        justifyContent: 'flex-start', // در RTL یعنی سمت راست
        '& .mantine-TableHeadCell-Content': {
          justifyContent: 'flex-start', // محتوای داخل هدر هم راست‌چین شود
        },
      },
      ...props.mantineTableHeadCellProps,
    },

    // --- اصلاح سلول‌ها ---
    mantineTableBodyCellProps: {
      align: 'right',
      className: 'text-right py-3', // کمی فاصله عمودی بیشتر برای زیبایی
      ...props.mantineTableBodyCellProps,
    },

    // 3. تنظیمات ستون عملیات
    enableRowActions: true,
    positionActionsColumn: 'last', // در RTL یعنی سمت چپ
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'عملیات',
        size: 120,
        // دکمه‌های عملیات وسط‌چین باشند قشنگ‌تر است
        mantineTableHeadCellProps: { align: 'center', sx: { justifyContent: 'center' } }, 
        mantineTableBodyCellProps: { align: 'center' },
      },
      ...props.displayColumnDefOptions,
    },

    // 4. تنظیمات حالت فشرده
    initialState: {
      density: 'xs',
      ...props.initialState,
    },

    // 5. آیکون‌های پیجینگ RTL
    icons: {
      KeyboardDoubleArrowLeftIcon: () => <ChevronsRight size={18} />, 
      KeyboardArrowLeftIcon: () => <ChevronRight size={18} />,        
      KeyboardArrowRightIcon: () => <ChevronLeft size={18} />,        
      KeyboardDoubleArrowRightIcon: () => <ChevronsLeft size={18} />, 
    },

    // تنظیمات رفتار
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });
  return (
    <div className="border rounded-xl overflow-hidden border-gray-200 bg-white">
      <MantineReactTable table={table} />
    </div>
  );
}