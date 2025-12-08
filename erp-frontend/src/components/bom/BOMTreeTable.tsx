"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Box,
  Package,
  Boxes,
  Circle,
  Factory,
  AlertTriangle,
  Cpu,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface BOMTreeNodeDto {
  key: string;
  bomId: number | null;
  productId: number;
  productName: string;
  productCode: string;
  unitName: string;
  quantity: number;
  totalQuantity: number;
  wastePercentage: number;
  type: string;
  isRecursive: boolean;
  children: BOMTreeNodeDto[];
}

interface BOMTreeTableProps {
  data: BOMTreeNodeDto;
}

export default function BOMTreeTable({ data }: BOMTreeTableProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* هدر جدول */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-4 border-blue-500 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-sm">
                <th className="p-4 text-right font-bold text-white w-[40%]">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <Boxes className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-base">ساختار محصول</span>
                  </div>
                </th>
                <th className="p-4 text-right font-bold text-white w-[10%]">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-purple-400" />
                    نوع
                  </div>
                </th>
                <th className="p-4 text-center font-bold text-white w-[10%]">
                  <div className="flex items-center justify-center gap-2">
                    <Package className="w-4 h-4 text-green-400" />
                    واحد
                  </div>
                </th>
                <th className="p-4 text-center font-bold text-white w-[12%]">
                  <div className="flex items-center justify-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    مقدار پایه
                  </div>
                </th>
                <th className="p-4 text-center font-bold text-white w-[10%]">
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ضایعات
                  </div>
                </th>
                <th className="p-4 text-center font-bold text-white w-[12%]">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    تعداد کل
                  </div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>

      {/* بدنه جدول */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <tbody>
            <TreeRow node={data} level={0} isRoot={true} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TreeRow({
  node,
  level,
  isRoot = false,
}: {
  node: BOMTreeNodeDto;
  level: number;
  isRoot?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (!hasChildren) return;
    setExpanded(!expanded);
  };

  // آیکون مناسب: برای زیرمجموعه Boxes، برای برگ Circle
  const getNodeIcon = () => {
    if (isRoot) return Box;
    if (hasChildren) return Boxes;
    return Circle;
  };

  // رنگ‌بندی متفاوت برای هر سطح
  const getLevelStyle = () => {
    const styles = [
      {
        bg: "from-blue-500 to-blue-600",
        bgLight: "bg-blue-50/60",
        border: "border-blue-300",
        text: "text-blue-700",
        icon: "text-blue-600",
      },
      {
        bg: "from-purple-500 to-purple-600",
        bgLight: "bg-purple-50/60",
        border: "border-purple-300",
        text: "text-purple-700",
        icon: "text-purple-600",
      },
      {
        bg: "from-emerald-500 to-emerald-600",
        bgLight: "bg-emerald-50/60",
        border: "border-emerald-300",
        text: "text-emerald-700",
        icon: "text-emerald-600",
      },
      {
        bg: "from-amber-500 to-amber-600",
        bgLight: "bg-amber-50/60",
        border: "border-amber-300",
        text: "text-amber-700",
        icon: "text-amber-600",
      },
      {
        bg: "from-cyan-500 to-cyan-600",
        bgLight: "bg-cyan-50/60",
        border: "border-cyan-300",
        text: "text-cyan-700",
        icon: "text-cyan-600",
      },
    ];
    return styles[Math.min(level, styles.length - 1)];
  };

  const NodeIcon = getNodeIcon();
  const levelStyle = getLevelStyle();
  const indentPadding = level * 36;

  // تعیین رنگ بج نوع
  const getTypeBadgeClass = () => {
    switch (node.type) {
      case "ماده اولیه":
        return "bg-slate-100 text-slate-700 border-slate-300";
      case "نیمه ساخته":
        return "bg-amber-100 text-amber-700 border-amber-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  return (
    <>
      <tr
        className={cn(
          "group transition-all duration-300 border-b border-slate-200",
          isRoot
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
            : `${levelStyle.bgLight} hover:bg-opacity-100`,
          "hover:shadow-md"
        )}
      >
        {/* ستون ساختار محصول */}
        <td className="p-3 relative">
          <div
            className="flex items-center gap-3 select-none"
            style={{ paddingRight: `${indentPadding}px` }}
          >
            {/* نوار رنگی سطح */}
            {level > 0 && (
              <div
                className={cn(
                  "absolute right-0 top-0 bottom-0 w-1 transition-all duration-200",
                  `bg-gradient-to-b ${levelStyle.bg}`
                )}
              />
            )}

            {/* دکمه باز/بسته */}
            <button
              onClick={handleToggle}
              disabled={!hasChildren}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200 border",
                hasChildren
                  ? "hover:bg-slate-100 border-slate-300 hover:border-slate-400 active:scale-95"
                  : "opacity-0 cursor-default border-transparent"
              )}
            >
              <div
                className={cn(
                  "transition-transform duration-200",
                  expanded ? "rotate-0" : "-rotate-90"
                )}
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            </button>

            {/* آیکون نود */}
            <div
              className={cn(
                "p-2.5 rounded-lg transition-all duration-200 border-2",
                isRoot
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 shadow-md"
                  : hasChildren
                  ? `bg-gradient-to-br ${levelStyle.bg} ${levelStyle.border} shadow-sm`
                  : `bg-white ${levelStyle.border} shadow-sm`,
                "group-hover:shadow-md"
              )}
            >
              <NodeIcon
                className={cn(
                  "w-4 h-4 transition-all duration-200",
                  isRoot || hasChildren ? "text-white" : levelStyle.icon
                )}
              />
            </div>

            {/* اطلاعات محصول */}
            <div className="flex flex-col min-w-0 flex-1">
              <span
                className={cn(
                  "font-semibold truncate",
                  isRoot
                    ? "text-base text-blue-900"
                    : `text-sm ${levelStyle.text}`
                )}
              >
                {node.productName}
              </span>
              <span
                className={cn(
                  "text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1 w-fit border border-slate-200"
                )}
              >
                {node.productCode}
              </span>
            </div>
          </div>
        </td>

        {/* ستون نوع */}
        <td className="p-3">
          <Badge
            variant="outline"
            className={cn(
              "font-medium text-[11px] border",
              getTypeBadgeClass()
            )}
          >
            {node.type}
          </Badge>
        </td>

        {/* ستون واحد */}
        <td className="p-3 text-center">
          <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
            {node.unitName}
          </span>
        </td>

        {/* ستون مقدار پایه */}
        <td className="p-3 text-center">
          <span
            className={cn(
              "font-mono font-semibold text-sm px-3 py-1.5 rounded-lg inline-block min-w-[60px] border",
              isRoot
                ? "bg-blue-500 text-white border-blue-400 shadow-sm"
                : "bg-slate-50 text-slate-800 border-slate-300"
            )}
          >
            {isRoot ? "1" : Number(node.quantity || 0).toLocaleString()}
          </span>
        </td>

        {/* ستون ضایعات */}
        <td className="p-3 text-center">
          {node.wastePercentage > 0 ? (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-md border border-red-300">
                {node.wastePercentage}%
              </span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
          ) : (
            <span className="text-slate-400 text-sm">—</span>
          )}
        </td>

        {/* ستون تعداد کل */}
        <td className="p-3 text-center">
          <span
            className={cn(
              "font-mono font-bold text-sm px-3 py-1.5 rounded-lg inline-block min-w-[70px] border-2 shadow-sm",
              `bg-gradient-to-br ${levelStyle.bg} text-white ${levelStyle.border}`
            )}
          >
            {Number(node.totalQuantity || 0).toLocaleString()}
          </span>
        </td>
      </tr>

      {/* رندر فرزندان با انیمیشن نرم */}
      {hasChildren && (
        <tr
          className={cn(
            "transition-all duration-300 ease-in-out",
            expanded ? "opacity-100" : "opacity-0 h-0"
          )}
        >
          <td colSpan={6} className="p-0">
            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                expanded ? "max-h-[10000px]" : "max-h-0"
              )}
            >
              <table className="w-full">
                <tbody>
                  {node.children.map((child) => (
                    <TreeRow
                      key={child.key}
                      node={child}
                      level={level + 1}
                      isRoot={false}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
