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
import { Loader2, Box, Layers, Component, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// --- اصلاح ۱: هماهنگ‌سازی با بک‌‌اند ---
interface BOMTreeNode {
  key: string;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number; // قبلاً quantityPerParent بود
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
    setData(null); // ریست کردن دیتا قبل از درخواست جدید

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
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            نمایش گرافیکی ساختار محصول
          </DialogTitle>
          <DialogDescription>
            ساختار درختی محصول{" "}
            <span className="font-bold text-primary">{rootProductName}</span>
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-auto bg-slate-50 p-8 relative"
          dir="ltr"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center flex-col gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>در حال ترسیم نمودار...</span>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center flex-col gap-2 text-red-500">
              <AlertCircle className="w-8 h-8" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <div className="min-w-fit flex justify-center pb-10">
              <TreeNode
                node={data}
                highlightId={highlightProductId}
                level={0}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              اطلاعاتی برای نمایش وجود ندارد.
            </div>
          )}
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
      <div
        className={cn(
          "relative flex flex-col items-center justify-center border rounded-lg px-4 py-3 min-w-[140px] transition-all duration-300 z-10",
          isTarget
            ? "bg-yellow-100 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110 ring-2 ring-yellow-400"
            : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300"
        )}
      >
        <div
          className={cn(
            "mb-2 p-1.5 rounded-full",
            isTarget
              ? "bg-yellow-200 text-yellow-700"
              : "bg-slate-100 text-slate-500"
          )}
        >
          <NodeIcon className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm text-center mb-1 text-slate-800">
          {node.productName}
        </span>
        <span className="text-[10px] text-slate-500 font-mono bg-slate-50 px-1.5 rounded border border-slate-100">
          {node.productCode}
        </span>

        {level > 0 && (
          <div className="mt-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">
            {/* اصلاح ۲: استفاده از quantity */}
            تعداد: {Number(node.quantity).toLocaleString()}
          </div>
        )}
      </div>

      {hasChildren && <div className="w-px h-8 bg-slate-300"></div>}

      {hasChildren && (
        <div className="flex gap-8 relative">
          {node.children.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-px bg-slate-300 mx-[calc(50%/var(--child-count))]"></div>
          )}

          {node.children.map((child, idx) => (
            <div key={idx} className="flex flex-col items-center relative">
              <div className="w-px h-6 bg-slate-300 mb-0"></div>
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
