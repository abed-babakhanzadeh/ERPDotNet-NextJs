"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import {
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
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700">
            اطلاعاتی یافت نشد
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full transition-all duration-300 bg-background",
        // تغییر مهم: z-[100] برای پوشاندن سایدبار (که z-60 دارد)
        isFullscreen
          ? "p-0 fixed inset-0 z-[100] bg-background"
          : "p-2 sm:p-4 space-y-4"
      )}
    >
      {/* هدر صفحه */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 transition-all duration-300 flex-shrink-0",
          isFullscreen ? "rounded-none border-x-0 border-t-0" : "shadow-sm"
        )}
      >
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-50" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between p-3 sm:p-4 gap-4">
          <div className="flex items-start gap-3 w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl blur-lg opacity-30 animate-pulse" />
              <div className="relative p-2.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
                <Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate">
                  ساختار درختی محصول
                </h1>
                <Sparkles className="w-3.5 h-3.5 text-purple-500 hidden sm:block" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-purple-100 max-w-full">
                  <Box className="w-3 h-3 text-purple-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-purple-900 truncate">
                    {data.productName}
                  </span>
                </div>
                <div className="px-2 py-0.5 bg-white/60 backdrop-blur-sm rounded-md text-[10px] sm:text-xs font-mono text-slate-600 border border-slate-200">
                  {data.productCode}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="h-8 bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">دانلود</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
            >
              <Printer className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">چاپ</span>
            </Button>

            <div className="w-px h-6 bg-slate-300 mx-1 hidden sm:block" />

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
              title={isFullscreen ? "خروج از تمام صفحه" : "تمام صفحه"}
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
              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
              title="بستن"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-hidden rounded-xl bg-card border transition-all duration-300",
          isFullscreen ? "rounded-none border-0" : "shadow-sm"
        )}
      >
        <BOMTreeTable data={data} />
      </div>

      {!isFullscreen && (
        <div className="text-[10px] text-muted-foreground text-center sm:text-right px-2">
          نمایش تا ۱۰ سطح ساختار محصول
        </div>
      )}
    </div>
  );
}

function TreeSkeleton() {
  return (
    <div className="p-4 space-y-4 h-full">
      <div className="rounded-xl border bg-muted/20 p-4 animate-pulse h-24" />
      <div className="flex-1 rounded-xl border bg-white p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
