"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

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
  columnKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
}

export function ColumnFilter({ columnKey, value, onChange }: ColumnFilterProps) {
  const [filterValue, setFilterValue] = useState(value || "");
  const debouncedFilterValue = useDebounce(filterValue, 500); // 500ms delay

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
  },[value])

  return (
    <Input
      placeholder={`جستجو...`}
      value={filterValue}
      onChange={(e) => setFilterValue(e.target.value)}
      className="h-8 py-1"
      onClick={(e) => e.stopPropagation()} // Prevent sort from triggering
    />
  );
}
