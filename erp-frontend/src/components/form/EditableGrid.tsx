"use client";

import React from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ... (تایپ‌ها بدون تغییر) ...
export type GridColumnType = "text" | "number" | "select" | "readonly";

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
    // تغییر ۱: اضافه کردن dir="rtl" به کانتینر اصلی
    <div className="flex flex-col h-full" dir="rtl">
      <div className="border rounded-md overflow-hidden flex-1 relative bg-card">
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10 border-b">
              <tr>
                <th className="w-12 p-3 text-center text-muted-foreground font-medium">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    // تغییر ۲: اطمینان از text-right برای هدرها
                    className="p-3 text-right font-medium text-muted-foreground"
                    style={{ width: col.width }}
                  >
                    {col.title}{" "}
                    {col.required && <span className="text-red-500">*</span>}
                  </th>
                ))}
                {!readOnly && <th className="w-16 p-3 text-center"></th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {safeData.map((row, index) => (
                <tr
                  key={row.id || index} // استفاده از id برای key
                  className="group hover:bg-muted/20 transition-colors"
                >
                  <td className="p-2 text-center text-muted-foreground text-xs">
                    {index + 1}
                  </td>

                  {columns.map((col) => (
                    <td key={String(col.key)} className="p-2">
                      {col.render ? (
                        col.render(row, index)
                      ) : col.type === "select" ? (
                        <select
                          disabled={readOnly || loading || col.disabled}
                          value={String(row[col.key] || "")}
                          onChange={(e) =>
                            handleCellChange(index, col.key, e.target.value)
                          }
                          // تغییر ۳: اضافه کردن text-right به سلکت
                          className={cn(
                            "w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50 text-right",
                            !row[col.key] &&
                              col.required &&
                              "border-red-200 bg-red-50"
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
                        <div className="px-2 py-1 bg-muted/20 rounded text-muted-foreground border border-transparent text-right">
                          {String(row[col.key] || "-")}
                        </div>
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
                            "w-full h-8 rounded border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary disabled:opacity-50",
                            // اعداد انگلیسی و چپ‌چین بمانند بهتر است، اما متن‌ها راست‌چین شوند
                            col.type === "number"
                              ? "text-left dir-ltr font-mono"
                              : "text-right",
                            !row[col.key] &&
                              col.required &&
                              "border-red-200 bg-red-50"
                          )}
                        />
                      )}
                    </td>
                  ))}

                  {!readOnly && (
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemove(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}

              {safeData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="p-8 text-center text-muted-foreground border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-20" />
                      <span>هیچ ردیفی اضافه نشده است.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!readOnly && onAddRow && (
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={loading}
            className="border-dashed border-2 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary gap-2 w-full"
          >
            <Plus size={16} />
            افزودن سطر جدید
          </Button>
        </div>
      )}
    </div>
  );
}
