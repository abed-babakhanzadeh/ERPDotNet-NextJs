"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import apiClient from "@/services/apiClient";
import {
  Loader2,
  Box,
  Layers,
  Component,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BOMTreeNode {
  key: string;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  totalQuantity: number;
  type: string;
  children: BOMTreeNode[];
}

interface VisualTreeDialogProps {
  open: boolean;
  onClose: () => void;
  bomId: number;
  highlightProductId: number | null;
  rootProductName: string;
}

export default function VisualTreeDialog({
  open,
  onClose,
  bomId,
  highlightProductId,
  rootProductName,
}: VisualTreeDialogProps) {
  const [data, setData] = useState<BOMTreeNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !bomId) return;

    setLoading(true);
    setError(null);
    setData(null);

    apiClient
      .get(`/BOMs/${bomId}/tree`)
      .then((res) => {
        if (res.data) setData(res.data);
        else setError("داده‌ای یافت نشد");
      })
      .catch((err) => {
        console.error(err);
        setError("خطا در دریافت ساختار درختی");
      })
      .finally(() => setLoading(false));
  }, [open, bomId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header با گرادیانت زیبا */}
        <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
              نمایش گرافیکی ساختار محصول
            </span>
          </DialogTitle>
          <DialogDescription className="text-base mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            ساختار درختی محصول{" "}
            <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
              {rootProductName}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* محتوای اصلی */}
        <div
          className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-8 relative"
          dir="ltr"
        >
          {/* پترن پس‌زمینه */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {loading ? (
            <div className="flex h-full items-center justify-center flex-col gap-3 text-muted-foreground relative z-10">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                <div className="absolute inset-0 w-12 h-12 animate-ping opacity-20">
                  <Loader2 className="w-12 h-12 text-purple-500" />
                </div>
              </div>
              <span className="text-lg font-medium">
                در حال ترسیم نمودار...
              </span>
              <span className="text-sm text-muted-foreground">
                لطفاً صبور باشید
              </span>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center flex-col gap-3 relative z-10">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <span className="text-lg font-semibold text-red-700">
                {error}
              </span>
              <span className="text-sm text-red-600">
                لطفاً دوباره تلاش کنید
              </span>
            </div>
          ) : data ? (
            <div className="min-w-fit flex justify-center pb-10 relative z-10">
              <TreeNode
                node={data}
                highlightId={highlightProductId}
                level={0}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground relative z-10">
              <div className="text-center">
                <Box className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                <p className="text-lg">اطلاعاتی برای نمایش وجود ندارد</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer با راهنما */}
        <div className="px-6 py-3 border-t bg-slate-50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm" />
              <span>قطعه مورد نظر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-300 shadow-sm" />
              <span>سایر قطعات</span>
            </div>
          </div>
          <span className="text-slate-400">
            برای بستن، خارج از پنجره کلیک کنید
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const TreeNode = ({
  node,
  highlightId,
  level,
}: {
  node: BOMTreeNode;
  highlightId: number | null;
  level: number;
}) => {
  const isTarget = highlightId ? node.productId === highlightId : false;
  const hasChildren = node.children && node.children.length > 0;
  const NodeIcon = level === 0 ? Box : hasChildren ? Layers : Component;

  return (
    <div className="flex flex-col items-center">
      {/* کارت محصول */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl px-5 py-4 min-w-[160px] transition-all duration-500 z-10 backdrop-blur-sm",
          isTarget
            ? "bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100 border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)] scale-110 ring-4 ring-yellow-300/50 animate-pulse"
            : level === 0
            ? "bg-gradient-to-br from-purple-100 via-white to-blue-100 border-2 border-purple-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-purple-400"
            : "bg-white/90 border-2 border-slate-200 shadow-lg hover:shadow-xl hover:scale-105 hover:border-blue-300"
        )}
      >
        {/* آیکون با انیمیشن */}
        <div
          className={cn(
            "mb-3 p-2 rounded-lg transition-all duration-300",
            isTarget
              ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 shadow-lg"
              : level === 0
              ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md"
              : hasChildren
              ? "bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-md"
              : "bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-md"
          )}
        >
          <NodeIcon className="w-5 h-5" />
        </div>

        {/* نام محصول */}
        <span
          className={cn(
            "font-bold text-sm text-center mb-2 leading-tight",
            isTarget
              ? "text-yellow-900"
              : level === 0
              ? "text-purple-900"
              : "text-slate-800"
          )}
        >
          {node.productName}
        </span>

        {/* کد محصول */}
        <span
          className={cn(
            "text-[10px] font-mono px-2 py-1 rounded-md border shadow-sm",
            isTarget
              ? "bg-yellow-200 text-yellow-800 border-yellow-300"
              : "bg-slate-100 text-slate-600 border-slate-200"
          )}
        >
          {node.productCode}
        </span>

        {/* بج تعداد */}
        {level > 0 && (
          <div
            className={cn(
              "mt-3 text-[11px] px-3 py-1 rounded-full font-semibold shadow-md border",
              isTarget
                ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border-yellow-400"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400"
            )}
          >
            تعداد: {Number(node.quantity).toLocaleString()}
          </div>
        )}

        {/* افکت نور برای نود هدف */}
        {isTarget && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-amber-400/20 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* خط اتصال عمودی */}
      {hasChildren && (
        <div
          className={cn(
            "w-0.5 h-10 relative",
            isTarget
              ? "bg-gradient-to-b from-yellow-400 to-yellow-300"
              : "bg-gradient-to-b from-slate-300 to-slate-400"
          )}
        >
          {/* گلوله‌های تزئینی روی خط */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-300 shadow-sm" />
        </div>
      )}

      {/* فرزندان */}
      {hasChildren && (
        <div className="flex gap-10 relative pt-2">
          {/* خط افقی اتصال */}
          {node.children.length > 1 && (
            <div
              className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent"
              style={{
                left: "50%",
                right: "50%",
                transform: "translateX(-50%)",
                width: `calc(100% - ${100 / node.children.length}%)`,
              }}
            />
          )}

          {node.children.map((child, idx) => (
            <div key={idx} className="flex flex-col items-center relative">
              {/* خط اتصال عمودی به فرزند */}
              <div className="w-0.5 h-8 bg-gradient-to-b from-slate-300 to-transparent mb-2" />
              <TreeNode
                node={child}
                highlightId={highlightId}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
