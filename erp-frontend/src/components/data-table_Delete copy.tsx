"use client";

import * as React from "react";
import 'react-resizable/css/styles.css';
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
import type { Unit, SortConfig, ColumnFilter, ColumnConfig } from "@/types";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableColumnHeader } from "./data-table-column-header";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Resizable } from 'react-resizable';

type PaginationState = {
    pageIndex: number;
    pageSize: number;
}

interface DataTableProps<TData extends Unit> {
  columns: ColumnConfig[];
  data: TData[];
  rowCount: number;
  pageCount: number;
  pagination: PaginationState;
  sortConfig: SortConfig;
  globalFilter: string;
  isLoading: boolean;

  onGlobalFilterChange: (value: string) => void;
  onPaginationChange: (updater: (old: PaginationState) => PaginationState) => void;
  onSortChange: (updater: (old: SortConfig) => SortConfig) => void;

  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
}

export function DataTable<TData extends Unit>({ 
    columns, 
    data,
    rowCount,
    pageCount,
    pagination,
    sortConfig,
    globalFilter,
    isLoading,
    onGlobalFilterChange,
    onPaginationChange,
    onSortChange,
    onEdit, 
    onDelete 
}: DataTableProps<TData>) {
  
  const [advancedFilters, setAdvancedFilters] = React.useState<ColumnFilter[]>([]);
  
  const initialLiveFilters = React.useMemo(() => columns.reduce((acc, col) => {
    acc[col.key] = '';
    return acc;
  }, {} as Record<keyof TData, string>), [columns]);

  const [liveFilters, setLiveFilters] = React.useState<Record<keyof TData, string>>(initialLiveFilters);
  
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [contextMenuUnit, setContextMenuUnit] = React.useState<TData | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: 150 }), { actions: 80 })
  );

  const handleResize = (key: string) => (e: any, { size }: any) => {
    setColumnWidths(prev => ({
      ...prev,
      [key]: size.width,
    }));
  };

  const handleSort = (key: keyof Unit) => {
    onSortChange(prev => {
        if (prev?.key === key && prev.direction === 'ascending') {
            return { key, direction: 'descending' };
        }
        return { key, direction: 'ascending' };
    });
  };
  
  const handleAdvancedFilterChange = (newFilter: ColumnFilter | null) => {
    onPaginationChange(p => ({ ...p, pageIndex: 0 }));
    setAdvancedFilters(prev => {
        const otherFilters = prev.filter(f => f.key !== newFilter?.key);
        if (newFilter && newFilter.conditions.length > 0 && newFilter.conditions.some(c => c.value !== '' && c.value !== null)) {
            return [...otherFilters, newFilter];
        }
        return otherFilters;
    });
  };

  const handleLiveFilterChange = (key: keyof TData, value: string) => {
    onPaginationChange(p => ({...p, pageIndex: 0}));
    setLiveFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleGlobalFilterChange = (value: string) => {
    onGlobalFilterChange(value);
    onPaginationChange(p => ({...p, pageIndex: 0}));
  }

  const handleClearAllFilters = () => {
    onGlobalFilterChange("");
    setAdvancedFilters([]);
    setLiveFilters(initialLiveFilters as Record<keyof TData, string>);
    onPaginationChange(p => ({...p, pageIndex: 0}));
  }

  const handleContextMenu = (e: React.MouseEvent, unit: TData) => {
      e.preventDefault();
      setContextMenuUnit(unit);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuOpen(true);
  }
  
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
        if (contextMenuOpen) {
           setContextMenuOpen(false);
           setContextMenuUnit(null);
        }
    }
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [contextMenuOpen]);

  const handleExport = () => {
    // This should ideally fetch all data from server for a complete export
    console.log("Exporting current page data...");
    const escapeCsvCell = (cell: any) => {
        if (cell == null) return '';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };
    
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row => columns.map(c => escapeCsvCell(row[c.key as keyof TData])).join(','));
    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };
  
  const handleRowAction = (action: 'edit' | 'delete') => {
      if (contextMenuUnit) {
          if (action === 'edit') {
              onEdit(contextMenuUnit);
          } else if (action === 'delete') {
              onDelete(contextMenuUnit);
          }
      }
      setContextMenuOpen(false);
      setContextMenuUnit(null);
  };

  return (
    <div className="w-full">
      <DataTableToolbar 
        globalFilter={globalFilter}
        onGlobalFilterChange={handleGlobalFilterChange}
        onClearAllFilters={handleClearAllFilters}
        onExport={handleExport}
        onPrint={handlePrint}
      />
      <div className="rounded-md border printable-area bg-card">
          <div className="relative max-h-[60vh] overflow-auto">
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHeader>
                    <TableRow>
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
                               <TableHead style={{ width: `${columnWidths[column.key]}px` }}>
                                <div className="flex items-center justify-between h-full overflow-hidden">
                                  <DataTableColumnHeader
                                      column={column}
                                      sortConfig={sortConfig}
                                      onSort={handleSort}
                                      filter={advancedFilters.find(f => f.key === column.key)}
                                      onFilterChange={handleAdvancedFilterChange}
                                      showSortButton={true}
                                  />
                                </div>
                              </TableHead>
                            </Resizable>
                        ))}
                        <TableHead className="no-print text-center sticky top-0 z-10 table-header-gradient" style={{ width: `${columnWidths.actions}px` }}>عملیات</TableHead>
                    </TableRow>
                      <TableRow className="no-print">
                          {columns.map((column) => (
                              <TableHead key={`${column.key}-filter`} className="p-1 align-middle" style={{ width: `${columnWidths[column.key]}px` }}>
                                  <div className="flex items-center relative">
                                      {column.type !== 'boolean' ? (
                                      <Input
                                          placeholder={`جستجو...`}
                                          value={liveFilters[column.key as keyof TData] as string}
                                          onChange={(e) => handleLiveFilterChange(column.key as keyof TData, e.target.value)}
                                          className="h-8 text-xs placeholder:text-neutral-400"
                                      />
                                      ) : <div className="h-8"></div>}
                                      <div className="absolute left-0">
                                      <DataTableColumnHeader 
                                          column={column}
                                          sortConfig={sortConfig}
                                          onSort={handleSort}
                                          filter={advancedFilters.find(f => f.key === column.key)}
                                          onFilterChange={handleAdvancedFilterChange}
                                          showSortButton={false}
                                      />
                                      </div>
                                  </div>
                              </TableHead>
                          ))}
                          <TableHead className="p-1 align-middle" style={{ width: `${columnWidths.actions}px` }}></TableHead>
                      </TableRow>
                </TableHeader>
                  <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                           <div className="flex justify-center items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span>در حال بارگذاری اطلاعات...</span>
                           </div>
                        </TableCell>
                     </TableRow>
                  ) : data.length > 0 ? (
                      data.map((row, index) => (
                      <TableRow 
                          key={(row as any).id || index}
                          onContextMenu={(e) => handleContextMenu(e, row)}
                           className={cn("cursor-context-menu", { "bg-muted/80 hover:bg-muted/90": contextMenuUnit?.id === row.id })}
                      >
                          {columns.map(column => (
                              <TableCell key={column.key} style={{ width: `${columnWidths[column.key]}px`, maxWidth: `${columnWidths[column.key]}px`}}>
                                  <div className="truncate">
                                    {column.key === 'isActive' ? (
                                    <Badge variant={row.isActive ? 'default' : 'destructive'} className={cn('text-white', row.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600')}>
                                        {row.isActive ? 'فعال' : 'غیرفعال'}
                                    </Badge>
                                    ) : (
                                    String(row[column.key as keyof TData] ?? '—')
                                    )}
                                  </div>
                              </TableCell>
                          ))}
                          <TableCell className="no-print text-center" style={{ width: `${columnWidths.actions}px` }}>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0 flex justify-center items-center rounded-md hover:bg-muted">
                                          <MoreHorizontal className="h-4 w-4" />
                                          <span className="sr-only">بازکردن منو</span>
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => onEdit(row)}>
                                          ویرایش
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => onDelete(row)} className="text-red-500 focus:text-red-500 focus:bg-red-100">
                                          حذف
                                      </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                      </TableRow>
                      ))
                  ) : (
                      <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                          هیچ نتیجه‌ای یافت نشد.
                      </TableCell>
                      </TableRow>
                  )}
                  </TableBody>
            </Table>
          </div>
        <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
            <DropdownMenuTrigger asChild>
                <div style={{ position: 'fixed', left: contextMenuPosition.x, top: contextMenuPosition.y }} />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenuItem onClick={() => handleRowAction('edit')}>
                    ویرایش
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRowAction('delete')} className="text-red-500 focus:text-red-500 focus:bg-red-100">
                    حذف
                </DropdownMenuItem>
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
