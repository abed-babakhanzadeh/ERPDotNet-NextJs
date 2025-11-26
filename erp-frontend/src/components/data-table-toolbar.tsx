"use client";

import { Download, Printer, Search, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  onClearAllFilters: () => void;
  onExport: () => void;
  onPrint: () => void;
}

export function DataTableToolbar({
  globalFilter,
  onGlobalFilterChange,
  onClearAllFilters,
  onExport,
  onPrint,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between py-4 no-print">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="جستجو در همه ستون‌ها..."
          value={globalFilter}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="max-w-sm ps-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onClearAllFilters}>
          <FilterX className="ms-2 h-4 w-4" />
          پاک کردن همه فیلترها
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="ms-2 h-4 w-4" />
          خروجی اکسل (CSV)
        </Button>
        <Button variant="outline" onClick={onPrint}>
          <Printer className="ms-2 h-4 w-4" />
          چاپ
        </Button>
      </div>
    </div>
  );
}
