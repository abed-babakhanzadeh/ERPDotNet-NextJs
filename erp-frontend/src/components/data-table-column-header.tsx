"use client";

import type {
  ColumnFilter,
  FilterCondition,
  Unit,
  ColumnConfig,
} from "@/types";
import {
  ArrowDown,
  ArrowUp,
  Filter as FilterIcon,
  FilterX,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DataTableColumnHeaderProps {
  column: ColumnConfig;
  sortConfig: { key: string; direction: "ascending" | "descending" } | null;
  onSort: (key: string) => void;
  filter: ColumnFilter | undefined;
  onFilterChange: (newFilter: ColumnFilter | null) => void;
}

const filterOperators = {
  string: [
    { value: "contains", label: "شامل" },
    { value: "equals", label: "مساوی با" },
    { value: "startsWith", label: "شروع با" },
  ],
  number: [
    { value: "equals", label: "=" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
    { value: "gte", label: "≥" },
    { value: "lte", label: "≤" },
    { value: "between", label: "بین" },
  ],
  boolean: [{ value: "equals", label: "برابر با" }],
};

export function DataTableColumnHeader({
  column,
  sortConfig,
  onSort,
  filter,
  onFilterChange,
}: DataTableColumnHeaderProps) {
  const isSorted = sortConfig?.key === column.key;
  const isFiltered =
    filter &&
    filter.conditions.length > 0 &&
    filter.conditions.some((c) => c.value !== "" && c.value !== null);

  return (
    <div className="flex items-center gap-1 w-full justify-between">
      <Button
        variant="ghost"
        onClick={() => onSort(column.key)}
        className="px-2 py-1 h-auto -mr-2 flex-grow justify-start"
      >
        <span className="truncate">{column.label}</span>
        {isSorted ? (
          sortConfig?.direction === "ascending" ? (
            <ArrowUp className="h-4 w-4 ml-2" />
          ) : (
            <ArrowDown className="h-4 w-4 ml-2" />
          )
        ) : (
          <div className="w-4 h-4 ml-2" />
        )}
      </Button>
      {/* Filter icon moved to the filter row under the header (ColumnFilter component) */}
      <div className="w-8" />
    </div>
  );
}

export function FilterPopoverContent({
  column,
  initialFilter,
  onApply,
  onClear,
}: {
  column: ColumnConfig;
  initialFilter: ColumnFilter | undefined;
  onApply: (filter: ColumnFilter) => void;
  onClear: () => void;
}) {
  const defaultCondition: FilterCondition = {
    id: crypto.randomUUID(),
    operator: filterOperators[column.type][0].value,
    value: "",
  };
  const [logic, setLogic] = useState<"and" | "or">(
    initialFilter?.logic || "and"
  );
  const [conditions, setConditions] = useState<FilterCondition[]>(
    initialFilter?.conditions.length
      ? initialFilter.conditions
      : [defaultCondition]
  );

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        operator: filterOperators[column.type][0].value,
        value: "",
      },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleApply = () => {
    const newFilter: ColumnFilter = {
      key: column.key,
      logic,
      conditions: conditions.filter((c) => c.value !== "" && c.value !== null),
    };
    onApply(newFilter);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="grid gap-4" onKeyDown={handleKeyDown}>
      <div className="space-y-2">
        <h4 className="font-medium leading-none">فیلتر {column.label}</h4>
        <p className="text-sm text-muted-foreground">
          ردیف‌ها را بر اساس یک یا چند شرط فیلتر کنید.
        </p>
      </div>

      {conditions.map((condition, index) => (
        <div
          key={condition.id}
          className="grid gap-2 p-2 border rounded-md relative"
        >
          {conditions.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 left-1 h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => removeCondition(condition.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor={`operator-${condition.id}`}>شرط</Label>
              <Select
                value={condition.operator}
                onValueChange={(op) =>
                  updateCondition(condition.id, { operator: op })
                }
              >
                <SelectTrigger id={`operator-${condition.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOperators[column.type].map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`value-${condition.id}`}>مقدار</Label>
              <FilterInput
                columnType={column.type}
                condition={condition}
                onChange={updateCondition}
              />
            </div>
          </div>
          {condition.operator === "between" && (
            <div className="grid grid-cols-2 gap-2">
              <div></div>
              <div className="grid gap-2">
                <Label htmlFor={`value2-${condition.id}`}>مقدار دوم</Label>
                <Input
                  id={`value2-${condition.id}`}
                  value={condition.value2 ?? ""}
                  onChange={(e) =>
                    updateCondition(condition.id, { value2: e.target.value })
                  }
                  type="number"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="justify-start"
      >
        <PlusCircle className="ms-2 h-4 w-4" />
        افزودن شرط
      </Button>

      {conditions.length > 1 && (
        <>
          <Separator />
          <RadioGroup
            value={logic}
            onValueChange={(val) => setLogic(val as "and" | "or")}
            className="flex items-center gap-4"
          >
            <Label>منطق اعمال فیلتر</Label>
            <div className="flex items-center space-i-2">
              <RadioGroupItem value="and" id={`logic-and-${column.key}`} />
              <Label htmlFor={`logic-and-${column.key}`}>و (And)</Label>
            </div>
            <div className="flex items-center space-i-2">
              <RadioGroupItem value="or" id={`logic-or-${column.key}`} />
              <Label htmlFor={`logic-or-${column.key}`}>یا (Or)</Label>
            </div>
          </RadioGroup>
        </>
      )}

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={onClear}>
          پاک کردن
        </Button>
        <Button size="sm" onClick={handleApply}>
          اعمال فیلتر
        </Button>
      </div>
    </div>
  );
}

function FilterInput({
  columnType,
  condition,
  onChange,
}: {
  columnType: ColumnConfig["type"];
  condition: FilterCondition;
  onChange: (id: string, updates: Partial<FilterCondition>) => void;
}) {
  if (columnType === "boolean") {
    return (
      <Select
        value={condition.value}
        onValueChange={(val) => onChange(condition.id, { value: val })}
      >
        <SelectTrigger id={`value-${condition.id}`}>
          <SelectValue placeholder="انتخاب وضعیت" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">فعال</SelectItem>
          <SelectItem value="false">غیرفعال</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      id={`value-${condition.id}`}
      value={condition.value || ""}
      onChange={(e) => onChange(condition.id, { value: e.target.value })}
      type={columnType === "number" ? "number" : "text"}
    />
  );
}
