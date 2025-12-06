"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Layers, ArrowRight, Printer, Share2, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BOMTreeTable, { BOMTreeNodeDto } from "@/components/bom/BOMTreeTable";
import { useTabs } from "@/providers/TabsProvider";

export default function BOMTreePage() {
  const params = useParams();
  const router = useRouter();
  const { closeTab, activeTabId } = useTabs();
  const id = Number(params.id);

  const [data, setData] = useState<BOMTreeNodeDto | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <TreeSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <Network className="w-12 h-12 opacity-20" />
        <p>اطلاعاتی یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 p-4">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              ساختار درختی محصول:{" "}
              <span className="text-primary">{data.productName}</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              کد محصول: {data.productCode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 ml-2" />
            چاپ
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => closeTab(activeTabId)}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* بدنه اصلی */}
      <div className="flex-1 overflow-auto bg-card rounded-lg shadow-sm">
        <BOMTreeTable data={data} />
      </div>
    </div>
  );
}

function TreeSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="border rounded-lg p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
