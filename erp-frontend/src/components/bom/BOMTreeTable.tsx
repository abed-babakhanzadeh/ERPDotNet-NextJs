"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  Layers,
  Component,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// اینترفیس اصلاح شده: نام فیلدها باید دقیقاً مثل JSON خروجی سرور باشد
export interface BOMTreeNodeDto {
  key: string;
  bomId: number | null;
  productId: number;
  productName: string;
  productCode: string;
  unitName: string;

  quantity: number; // <--- اصلاح شد (قبلاً quantityPerParent بود)
  totalQuantity: number;

  wastePercentage: number;
  type: string;

  // سرور isRecursive می‌فرستد، اما ما اینجا بر اساس children چک می‌کنیم
  // پس نیازی به hasChildren در اینترفیس نیست، اما اگر باشد باید isRecursive باشد
  isRecursive: boolean;

  children: BOMTreeNodeDto[];
}

interface BOMTreeTableProps {
  data: BOMTreeNodeDto;
}

export default function BOMTreeTable({ data }: BOMTreeTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 text-right font-medium text-muted-foreground w-[40%]">
                ساختار محصول
              </th>
              <th className="p-3 text-right font-medium text-muted-foreground w-[10%]">
                نوع
              </th>
              <th className="p-3 text-right font-medium text-muted-foreground w-[10%]">
                واحد
              </th>
              <th className="p-3 text-center font-medium text-muted-foreground w-[10%]">
                مقدار پایه
              </th>
              <th className="p-3 text-center font-medium text-muted-foreground w-[10%]">
                ضایعات %
              </th>
              <th className="p-3 text-center font-medium text-muted-foreground w-[10%]">
                تعداد کل
              </th>
            </tr>
          </thead>
          <tbody>
            <TreeRow node={data} level={0} isRoot={true} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

// کامپوننت بازگشتی سطر
function TreeRow({
  node,
  level,
  isRoot = false,
}: {
  node: BOMTreeNodeDto;
  level: number;
  isRoot?: boolean;
}) {
  const [expanded, setExpanded] = useState(true); // پیش‌فرض باز باشد

  // بررسی وجود فرزندان برای نمایش آیکون و دکمه باز/بسته
  const hasChildren = node.children && node.children.length > 0;

  // تعیین آیکون بر اساس سطح
  const NodeIcon = isRoot ? Layers : hasChildren ? Component : CircleDot;
  const iconColor = isRoot
    ? "text-blue-600"
    : hasChildren
    ? "text-indigo-500"
    : "text-slate-400";

  return (
    <>
      <tr
        className={cn(
          "border-b transition-colors hover:bg-muted/30",
          isRoot && "bg-blue-50/50 hover:bg-blue-50"
        )}
      >
        <td className="p-2">
          <div
            className="flex items-center gap-2 select-none"
            style={{ paddingRight: `${level * 24}px` }} // فرورفتگی (Indentation)
          >
            {/* دکمه باز/بسته کردن */}
            <button
              onClick={() => setExpanded(!expanded)}
              disabled={!hasChildren}
              className={cn(
                "p-1 rounded hover:bg-muted/50 transition-transform",
                !hasChildren && "opacity-0"
              )}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* آیکون و نام */}
            <NodeIcon className={cn("w-4 h-4", iconColor)} />

            <div className="flex flex-col">
              <span
                className={cn("font-medium", isRoot ? "text-base" : "text-sm")}
              >
                {node.productName}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {node.productCode}
              </span>
            </div>
          </div>
        </td>

        {/* نوع */}
        <td className="p-2 text-right">
          <Badge
            variant="outline"
            className={cn(
              "font-normal text-[10px]",
              node.type === "ماده اولیه"
                ? "bg-slate-100 text-slate-600 border-slate-200"
                : node.type === "نیمه ساخته"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            {node.type}
          </Badge>
        </td>

        {/* واحد */}
        <td className="p-2 text-right text-muted-foreground">
          {node.unitName}
        </td>

        {/* مقدار پایه (ضریب مصرف در این مرحله) */}
        <td className="p-2 text-center font-mono text-muted-foreground dir-ltr">
          {/* اصلاح شده: استفاده از node.quantity به جای node.quantityPerParent */}
          {isRoot ? "1" : Number(node.quantity || 0).toLocaleString()}
        </td>

        {/* ضایعات */}
        <td className="p-2 text-center text-muted-foreground text-xs">
          {node.wastePercentage > 0 ? (
            <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              {node.wastePercentage}%
            </span>
          ) : (
            "-"
          )}
        </td>

        {/* تعداد کل (محاسبه شده) */}
        <td className="p-2 text-center font-mono font-medium dir-ltr">
          {Number(node.totalQuantity || 0).toLocaleString()}
        </td>
      </tr>

      {/* رندر کردن فرزندان (Recursive) */}
      {hasChildren &&
        expanded &&
        node.children.map((child) => (
          <TreeRow key={child.key} node={child} level={level + 1} />
        ))}
    </>
  );
}
