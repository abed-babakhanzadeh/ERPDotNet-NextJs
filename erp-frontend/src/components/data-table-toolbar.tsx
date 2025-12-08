"use client";

import { Download, Printer, Search, FilterX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DataTableToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onClearAllFilters: () => void;
  onExport: () => void;
  onPrint: () => void;
  onRefresh?: () => void;
  activeFiltersCount?: number;
  isExporting?: boolean; // اضافه شده
}

export function DataTableToolbar({
  globalFilter,
  onGlobalFilterChange,
  onClearAllFilters,
  onExport,
  onPrint,
  onRefresh,
  activeFiltersCount = 0,
  isExporting = false, // اضافه شده
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between py-3 no-print">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="جستجو در همه ستون‌ها..."
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="max-w-sm ps-10 h-9"
        />
      </div>
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="h-9 px-3">
            {activeFiltersCount} فیلتر فعال
          </Badge>
        )}
        <Button
          variant="outline"
          onClick={onClearAllFilters}
          size="sm"
          className="h-9"
        >
          <FilterX className="ms-2 h-4 w-4" />
          پاک کردن فیلترها
        </Button>
        {onRefresh && (
          <Button
            variant="outline"
            onClick={onRefresh}
            size="sm"
            className="h-9"
          >
            <RefreshCw className="ms-2 h-4 w-4" />
            بروزرسانی
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onExport}
          size="sm"
          className="h-9"
          disabled={isExporting}
        >
          <Download className="ms-2 h-4 w-4" />
          {isExporting ? "در حال خروجی..." : "خروجی Excel"}
        </Button>
        <Button variant="outline" onClick={onPrint} size="sm" className="h-9">
          <Printer className="ms-2 h-4 w-4" />
          چاپ
        </Button>
      </div>
    </div>
  );
}
