"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaginationState } from "@tanstack/react-table";

interface DataTablePaginationProps {
  pagination: PaginationState;
  onPaginationChange: (updater: (old: PaginationState) => PaginationState) => void;
  pageCount: number;
  rowCount: number;
}

export function DataTablePagination({
  pagination,
  onPaginationChange,
  pageCount,
  rowCount
}: DataTablePaginationProps) {

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = e.target.value ? Number(e.target.value) - 1 : 0;
    if (page >= 0 && page < pageCount) {
        onPaginationChange(old => ({ ...old, pageIndex: page }));
    }
  };

  const setPageIndex = (index: number) => {
    onPaginationChange(old => ({ ...old, pageIndex: index }));
  };

  const setPageSize = (size: number) => {
    onPaginationChange(old => ({ pageIndex: 0, pageSize: size }));
  };


  return (
    <div className="flex items-center justify-between px-2 py-4 no-print">
      <div className="flex-1 text-sm text-muted-foreground">
        {rowCount} ردیف در کل.
      </div>
      <div className="flex items-center space-i-6 lg:space-i-8">
        <div className="flex items-center space-i-2">
          <p className="text-sm font-medium">ردیف در هر صفحه</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[120px] items-center justify-center text-sm font-medium">
          صفحه {pageCount > 0 ? pagination.pageIndex + 1 : 0} از {pageCount}
        </div>
        <div className="flex items-center space-i-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPageIndex(0)}
            disabled={pagination.pageIndex === 0}
          >
            <span className="sr-only">برو به اولین صفحه</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageIndex(pagination.pageIndex - 1)}
            disabled={pagination.pageIndex === 0}
          >
            <span className="sr-only">برو به صفحه قبل</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
           <span className="text-sm">
            <Input
                type="number"
                min={1}
                max={pageCount}
                value={pagination.pageIndex + 1}
                onChange={handlePageInputChange}
                className="h-8 w-16 text-center"
                disabled={pageCount <= 1}
            />
           </span>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPageIndex(pagination.pageIndex + 1)}
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            <span className="sr-only">برو به صفحه بعد</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pagination.pageIndex >= pageCount - 1}
          >
            <span className="sr-only">برو به آخرین صفحه</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
