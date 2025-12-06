"use client";

import * as React from "react";
import "react-resizable/css/styles.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2 } from "lucide-react";
import type {
  SortConfig,
  ColumnFilter as AdvancedColumnFilter,
  ColumnConfig,
} from "@/types";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableColumnHeader } from "./data-table-column-header";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Resizable } from "react-resizable";
import { ColumnFilter } from "./column-filter";

type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

// Base interface برای تمام table rows
interface TableRow {
  id: number | string;
  [key: string]: any;
}

interface DataTableProps<TData extends TableRow> {
  columns: ColumnConfig[];
  data: TData[];
  rowCount: number;
  pageCount: number;
  pagination: PaginationState;
  sortConfig: SortConfig;
  globalFilter: string;
  advancedFilters: AdvancedColumnFilter[];
  columnFilters: Record<string, string>;
  isLoading: boolean;

  onGlobalFilterChange: (value: string) => void;
  onAdvancedFilterChange: (newFilter: AdvancedColumnFilter | null) => void;
  onColumnFilterChange: (key: string, value: string) => void;
  onClearAllFilters: () => void;
  onPaginationChange: (
    updater: (old: PaginationState) => PaginationState
  ) => void;
  onSortChange: (
    updater: ((old: SortConfig) => SortConfig | null) | SortConfig | null
  ) => void;

  renderRowActions?: (row: TData) => React.ReactNode;
  renderContextMenu?: (row: TData, closeMenu: () => void) => React.ReactNode;

  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
}

export function DataTable<TData extends TableRow>({
  columns,
  data,
  rowCount,
  pageCount,
  pagination,
  sortConfig,
  globalFilter,
  advancedFilters,
  columnFilters,
  isLoading,
  onGlobalFilterChange,
  onAdvancedFilterChange,
  onColumnFilterChange,
  onClearAllFilters,
  onPaginationChange,
  onSortChange,
  renderRowActions,
  renderContextMenu,
  onEdit,
  onDelete,
}: DataTableProps<TData>) {
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [contextMenuRow, setContextMenuRow] = React.useState<TData | null>(
    null
  );
  const [contextMenuPosition, setContextMenuPosition] = React.useState({
    x: 0,
    y: 0,
  });
  const [selectedRowId, setSelectedRowId] = React.useState<
    number | string | null
  >(null);

  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: 150 }), { actions: 140 })
  );

  const handleResize =
    (key: string) =>
    (e: any, { size }: any) => {
      setColumnWidths((prev) => ({ ...prev, [key]: size.width }));
    };

  const handleSort = (key: string) => {
    onSortChange((prev) => {
      if (prev?.key === key) {
        return prev.direction === "ascending"
          ? { key, direction: "descending" }
          : null;
      }
      return { key, direction: "ascending" };
    });
  };

  const handleGlobalFilterChange = (value: string) => {
    onPaginationChange((p) => ({ ...p, pageIndex: 0 }));
    onGlobalFilterChange(value);
  };

  const handleRowClick = (row: TData) => {
    setSelectedRowId(row.id);
  };

  const handleContextMenu = (e: React.MouseEvent, row: TData) => {
    e.preventDefault();
    setSelectedRowId(row.id);
    setContextMenuRow(row);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!contextMenuOpen) return;
      setContextMenuOpen(false);
      setContextMenuRow(null);
      if (
        !(e.target as HTMLElement).closest('[role="row"], [role="menuitem"]')
      ) {
        setSelectedRowId(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenuOpen]);

  const closeContextMenu = () => {
    setContextMenuOpen(false);
    setContextMenuRow(null);
  };

  const handleExport = () => {
    console.log("Export triggered");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-4">
      <DataTableToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={handleGlobalFilterChange}
        onClearAllFilters={onClearAllFilters}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      <div className="rounded-md border border-border printable-area bg-card">
        <div className="relative max-h-[60vh] overflow-auto custom-scrollbar">
          <Table style={{ tableLayout: "fixed", width: "100%" }}>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                {columns.map((column) => (
                  <Resizable
                    key={column.key}
                    width={columnWidths[column.key] as number}
                    height={0}
                    onResize={handleResize(column.key)}
                    axis="x"
                    minConstraints={[50, 0]}
                    maxConstraints={[500, Infinity]}
                  >
                    <TableHead
                      style={{ width: `${columnWidths[column.key]}px` }}
                      className="bg-muted/50 text-muted-foreground"
                    >
                      <div className="flex items-center justify-between h-full overflow-hidden">
                        <DataTableColumnHeader
                          column={column}
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          filter={advancedFilters.find(
                            (f) => f.key === column.key
                          )}
                          onFilterChange={onAdvancedFilterChange}
                        />
                      </div>
                    </TableHead>
                  </Resizable>
                ))}
                <TableHead
                  className="no-print text-center sticky top-0 z-10 bg-muted/50 text-muted-foreground"
                  style={{ width: `${columnWidths.actions}px` }}
                >
                  عملیات
                </TableHead>
              </TableRow>

              <TableRow className="no-print bg-muted/10 hover:bg-muted/10 border-b border-border">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    style={{
                      width: `${columnWidths[column.key]}px`,
                      maxWidth: `${columnWidths[column.key]}px`,
                    }}
                  >
                    <ColumnFilter
                      column={column}
                      columnKey={column.key}
                      value={columnFilters[column.key]}
                      initialAdvancedFilter={advancedFilters.find(
                        (f) => f.key === column.key
                      )}
                      onChange={onColumnFilterChange}
                      onApplyAdvancedFilter={onAdvancedFilterChange}
                    />
                  </TableCell>
                ))}
                <TableCell key="actions-filter" className="p-1"></TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-muted-foreground">
                        در حال بارگذاری اطلاعات...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    onClick={() => handleRowClick(row)}
                    onContextMenu={(e) => handleContextMenu(e, row)}
                    className={cn(
                      "cursor-pointer border-b border-border transition-colors",
                      // نکته مهم: استفاده از !bg-orange-... برای اعمال اجباری رنگ روی حالت‌های Striped
                      selectedRowId === row.id
                        ? "!bg-orange-100 dark:!bg-orange-900/40 text-orange-900 dark:text-orange-100 hover:!bg-orange-200 dark:hover:!bg-orange-900/50"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        style={{
                          width: `${columnWidths[column.key]}px`,
                          maxWidth: `${columnWidths[column.key]}px`,
                        }}
                      >
                        <div className="truncate flex items-center">
                          {column.render ? (
                            column.render(row[column.key as keyof TData], row)
                          ) : column.key === "isActive" ? (
                            <Badge
                              variant={row.isActive ? "default" : "destructive"}
                              className={cn(
                                "text-white",
                                row.isActive
                                  ? "bg-emerald-500 hover:bg-emerald-600"
                                  : "bg-red-500 hover:bg-red-600"
                              )}
                            >
                              {row.isActive ? "فعال" : "غیرفعال"}
                            </Badge>
                          ) : (
                            String(row[column.key as keyof TData] ?? "—")
                          )}
                        </div>
                      </TableCell>
                    ))}

                    <TableCell
                      className="no-print text-center"
                      style={{ width: `${columnWidths.actions}px` }}
                    >
                      {renderRowActions ? (
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderRowActions(row)}
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 flex justify-center items-center rounded-md hover:bg-accent text-muted-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-popover border-border"
                          >
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(row)}>
                                ویرایش
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                onClick={() => onDelete(row)}
                                className="text-destructive"
                              >
                                حذف
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center text-muted-foreground"
                  >
                    هیچ نتیجه‌ای یافت نشد.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div
              style={{
                position: "fixed",
                left: contextMenuPosition.x,
                top: contextMenuPosition.y,
              }}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="bg-popover border-border min-w-[160px]"
          >
            {contextMenuRow && renderContextMenu ? (
              renderContextMenu(contextMenuRow, closeContextMenu)
            ) : (
              <>
                {contextMenuRow && onEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      onEdit(contextMenuRow!);
                      closeContextMenu();
                    }}
                  >
                    ویرایش
                  </DropdownMenuItem>
                )}
                {contextMenuRow && onDelete && (
                  <DropdownMenuItem
                    onClick={() => {
                      onDelete(contextMenuRow!);
                      closeContextMenu();
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    حذف
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DataTablePagination
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        pageCount={pageCount}
        rowCount={rowCount}
      />
    </div>
  );
}
