"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter as FilterIcon, FilterX } from "lucide-react";
import type { ColumnConfig, ColumnFilter as AdvancedColumnFilter } from "@/types";
import { FilterPopoverContent } from "./data-table-column-header";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface ColumnFilterProps {
  column: ColumnConfig;
  columnKey: string;
  value: string;
  initialAdvancedFilter?: AdvancedColumnFilter | undefined;
  onChange: (key: string, value: string) => void;
  onApplyAdvancedFilter: (newFilter: AdvancedColumnFilter | null) => void;
}

export function ColumnFilter({ column, columnKey, value, initialAdvancedFilter, onChange, onApplyAdvancedFilter }: ColumnFilterProps) {
  const [filterValue, setFilterValue] = useState(value || "");
  const debouncedFilterValue = useDebounce(filterValue, 500); // 500ms delay
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isFiltered =
    initialAdvancedFilter &&
    initialAdvancedFilter.conditions.length > 0 &&
    initialAdvancedFilter.conditions.some((c) => c.value !== "" && c.value !== null);

  useEffect(() => {
    if (debouncedFilterValue !== value) {
      onChange(columnKey, debouncedFilterValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilterValue]);

  useEffect(() => {
    // Sync local state with parent state
    if (value !== filterValue) {
      setFilterValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder={`جستجو...`}
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        className="h-8 py-1 flex-1"
        onClick={(e) => e.stopPropagation()} // Prevent sort from triggering
      />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={isFiltered ? "h-8 w-8 text-primary bg-primary/10" : "h-8 w-8"}
            onClick={(e) => e.stopPropagation()}
          >
            {isFiltered ? <FilterX className="h-4 w-4" /> : <FilterIcon className="h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <FilterPopoverContent
            column={column}
            initialFilter={initialAdvancedFilter as any}
            onApply={(newFilterState: AdvancedColumnFilter) => {
              onApplyAdvancedFilter(newFilterState);
              setPopoverOpen(false);
            }}
            onClear={() => {
              onApplyAdvancedFilter(null);
              setPopoverOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
