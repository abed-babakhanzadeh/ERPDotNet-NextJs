"use client";

import React from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PersianDatePicker from "@/components/ui/PersianDatePicker";

export type GridColumnType = "text" | "number" | "select" | "readonly" | "date";

export interface GridColumn<T> {
  key: keyof T;
  title: string;
  type: GridColumnType;
  width?: string;
  options?: { label: string; value: any }[];
  required?: boolean;
  placeholder?: string;
  render?: (row: T, index: number) => React.ReactNode;
  disabled?: boolean;
}

interface EditableGridProps<T> {
  columns: GridColumn<T>[];
  data: T[];
  onChange: (newData: T[]) => void;
  onAddRow?: () => T;
  loading?: boolean;
  readOnly?: boolean;
}

export default function EditableGrid<T extends { id?: number | string }>({
  columns,
  data,
  onChange,
  onAddRow,
  loading,
  readOnly = false,
}: EditableGridProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  const handleCellChange = (index: number, key: keyof T, value: any) => {
    const newData = [...safeData];
    newData[index] = { ...newData[index], [key]: value };
    onChange(newData);
  };

  const handleAdd = () => {
    if (onAddRow) {
      onChange([...safeData, onAddRow()]);
    }
  };

  const handleRemove = (index: number) => {
    const newData = [...safeData];
    newData.splice(index, 1);
    onChange(newData);
  };

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="border rounded-lg overflow-hidden flex-1 relative bg-card shadow-sm">
        <div className="overflow-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0 z-10 border-b">
              <tr>
                <th className="w-10 p-2 text-center text-muted-foreground font-semibold text-[11px]">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="p-2 text-right font-semibold text-muted-foreground text-[11px]"
                    style={{ width: col.width }}
                  >
                    {col.title}{" "}
                    {col.required && <span className="text-red-500">*</span>}
                  </th>
                ))}
                {!readOnly && <th className="w-12 p-2 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {safeData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="group hover:bg-muted/20 transition-colors"
                >
                  <td className="p-2 text-center text-muted-foreground text-[11px]">
                    {index + 1}
                  </td>

                  {columns.map((col) => (
                    <td key={String(col.key)} className="p-1.5">
                      {col.render ? (
                        col.render(row, index)
                      ) : col.type === "select" ? (
                        <select
                          disabled={readOnly || loading || col.disabled}
                          value={String(row[col.key] || "")}
                          onChange={(e) =>
                            handleCellChange(index, col.key, e.target.value)
                          }
                          className={cn(
                            "w-full h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 text-right transition-all",
                            !row[col.key] &&
                              col.required &&
                              "border-red-300 bg-red-50/50 dark:bg-red-900/10"
                          )}
                        >
                          <option value="">انتخاب...</option>
                          {col.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : col.type === "readonly" ? (
                        <div className="px-2 py-1 bg-muted/30 rounded text-muted-foreground border border-transparent text-right text-xs">
                          {String(row[col.key] || "-")}
                        </div>
                      ) : col.type === "date" ? (
                        <PersianDatePicker
                          value={String(row[col.key] || "")}
                          onChange={(newVal) =>
                            handleCellChange(index, col.key, newVal)
                          }
                          disabled={readOnly || loading || col.disabled}
                          required={col.required}
                          className="w-full h-7"
                        />
                      ) : (
                        <input
                          type={col.type}
                          disabled={readOnly || loading || col.disabled}
                          value={String(row[col.key] || "")}
                          placeholder={col.placeholder}
                          onChange={(e) =>
                            handleCellChange(index, col.key, e.target.value)
                          }
                          className={cn(
                            "w-full h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 transition-all",
                            col.type === "number"
                              ? "text-left dir-ltr font-mono"
                              : "text-right",
                            !row[col.key] &&
                              col.required &&
                              "border-red-300 bg-red-50/50 dark:bg-red-900/10"
                          )}
                        />
                      )}
                    </td>
                  ))}

                  {!readOnly && (
                    <td className="p-1.5 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemove(index)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}

              {safeData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="p-6 text-center text-muted-foreground border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6 opacity-20" />
                      <span className="text-xs">هیچ ردیفی وجود ندارد.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Loading Bar */}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div className="h-full bg-blue-500 dark:bg-blue-600 animate-loading-bar"></div>
          </div>
        )}
      </div>

      {!readOnly && onAddRow && (
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={loading}
            className="border-dashed border-2 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary gap-1.5 w-full h-8 text-xs"
          >
            <Plus size={14} />
            افزودن سطر جدید
          </Button>
        </div>
      )}
    </div>
  );
}
