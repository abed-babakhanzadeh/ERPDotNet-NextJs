"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import {
  Layers,
  ArrowRight,
  Printer,
  Download,
  Network,
  Sparkles,
  Box,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BOMTreeTable, { BOMTreeNodeDto } from "@/components/bom/BOMTreeTable";
import { useTabs } from "@/providers/TabsProvider";
import { cn } from "@/lib/utils";

export default function BOMTreePage() {
  const params = useParams();
  const router = useRouter();
  const { closeTab, activeTabId } = useTabs();
  const id = Number(params.id);

  const [data, setData] = useState<BOMTreeNodeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get(`/BOMs/${id}/tree`);
        setData(res.data);
      } catch (error) {
        toast.error("خطا در دریافت ساختار درختی");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    toast.info("قابلیت دانلود به زودی اضافه می‌شود");
  };

  if (loading) {
    return <TreeSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl">
            <Network className="w-16 h-16 text-slate-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            اطلاعاتی یافت نشد
          </p>
          <p className="text-sm text-slate-500 mt-1">لطفاً دوباره تلاش کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-300",
        isFullscreen ? "p-0" : "p-4 space-y-4"
      )}
    >
      {/* هدر صفحه با گرادیانت زیبا */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 transition-all duration-300",
          isFullscreen ? "rounded-none" : "shadow-lg"
        )}
      >
        {/* پترن پس‌زمینه */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50" />

        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {/* آیکون با انیمیشن */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur-lg opacity-30 animate-pulse" />
              <div className="relative p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
                <Network className="w-6 h-6 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ساختار درختی محصول
                </h1>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-purple-100">
                  <Box className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-900">
                    {data.productName}
                  </span>
                </div>
                <div className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs font-mono text-slate-600 border border-slate-200">
                  کد: {data.productCode}
                </div>
              </div>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
            >
              <Download className="w-4 h-4 ml-2" />
              دانلود
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
            >
              <Printer className="w-4 h-4 ml-2" />
              چاپ
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => closeTab(activeTabId)}
              className="hover:bg-white/60"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* بدنه اصلی */}
      <div
        className={cn(
          "flex-1 overflow-hidden rounded-xl transition-all duration-300",
          isFullscreen ? "rounded-none" : "shadow-lg"
        )}
      >
        <BOMTreeTable data={data} />
      </div>

      {/* Footer با آمار */}
      <div
        className={cn(
          "bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border shadow-sm transition-all duration-300",
          isFullscreen && "rounded-none"
        )}
      >
        <div className="p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-600">محصول نهایی</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-slate-600">نیمه‌ساخته</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="text-slate-600">ماده اولیه</span>
            </div>
          </div>
          <span className="text-slate-400">
            برای چاپ، دکمه چاپ را کلیک کنید
          </span>
        </div>
      </div>
    </div>
  );
}

function TreeSkeleton() {
  return (
    <div className="p-4 space-y-4 h-full">
      {/* هدر اسکلتون */}
      <div className="rounded-xl border bg-gradient-to-r from-slate-100 to-slate-50 p-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      {/* جدول اسکلتون */}
      <div className="flex-1 rounded-xl border bg-white p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
