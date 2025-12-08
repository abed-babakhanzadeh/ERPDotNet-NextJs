"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface DataTablePaginationProps {
  pagination: PaginationState;
  onPaginationChange: (
    updater: (old: PaginationState) => PaginationState
  ) => void;
  pageCount: number;
  rowCount: number;
}

export function DataTablePagination({
  pagination,
  onPaginationChange,
  pageCount,
  rowCount,
}: DataTablePaginationProps) {
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = e.target.value ? Number(e.target.value) - 1 : 0;
    if (page >= 0 && page < pageCount) {
      onPaginationChange((old) => ({ ...old, pageIndex: page }));
    }
  };

  const setPageIndex = (index: number) => {
    onPaginationChange((old) => ({ ...old, pageIndex: index }));
  };

  const setPageSize = (size: number) => {
    onPaginationChange((old) => ({ pageIndex: 0, pageSize: size }));
  };

  const startRow =
    pageCount > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0;
  const endRow = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    rowCount
  );

  return (
    <div className="flex items-center justify-between px-2 py-4 no-print border-t bg-muted/30">
      {/* اطلاعات سمت چپ */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">نمایش</span>
          <span className="font-medium text-foreground">
            {startRow} تا {endRow}
          </span>
          <span className="text-muted-foreground">از</span>
          <span className="font-medium text-primary">{rowCount}</span>
          <span className="text-muted-foreground">ردیف</span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* تعداد ردیف در هر صفحه */}
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            تعداد در صفحه:
          </p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[75px] text-sm">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* کنترل‌های صفحه‌بندی */}
      <div className="flex items-center gap-2">
        {/* اولین صفحه */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "hidden h-9 w-9 lg:flex transition-all",
            pagination.pageIndex === 0 && "opacity-50"
          )}
          onClick={() => setPageIndex(0)}
          disabled={pagination.pageIndex === 0}
        >
          <span className="sr-only">برو به اولین صفحه</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>

        {/* صفحه قبل */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 transition-all",
            pagination.pageIndex === 0 && "opacity-50"
          )}
          onClick={() => setPageIndex(pagination.pageIndex - 1)}
          disabled={pagination.pageIndex === 0}
        >
          <span className="sr-only">برو به صفحه قبل</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* نمایش و ویرایش شماره صفحه */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            صفحه
          </span>
          <Input
            type="number"
            min={1}
            max={pageCount > 0 ? pageCount : 1}
            value={pageCount > 0 ? pagination.pageIndex + 1 : 1}
            onChange={handlePageInputChange}
            className="h-9 w-16 text-center text-sm font-medium"
            disabled={pageCount <= 1}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            از {pageCount}
          </span>
        </div>

        {/* صفحه بعد */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 transition-all",
            pagination.pageIndex >= pageCount - 1 && "opacity-50"
          )}
          onClick={() => setPageIndex(pagination.pageIndex + 1)}
          disabled={pagination.pageIndex >= pageCount - 1}
        >
          <span className="sr-only">برو به صفحه بعد</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* آخرین صفحه */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "hidden h-9 w-9 lg:flex transition-all",
            pagination.pageIndex >= pageCount - 1 && "opacity-50"
          )}
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={pagination.pageIndex >= pageCount - 1}
        >
          <span className="sr-only">برو به آخرین صفچه</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
