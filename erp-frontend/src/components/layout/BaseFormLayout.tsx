"use client";

import React from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/providers/TabsProvider";

interface BaseFormLayoutProps {
  title: string;
  isLoading?: boolean;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  onCancel?: () => void;
  headerActions?: React.ReactNode;
  formId?: string; // <--- پراپ جدید برای اتصال دکمه هدر به فرم
}

export default function BaseFormLayout({
  title,
  isLoading = false,
  children,
  onSubmit,
  onCancel,
  headerActions,
  formId = "base-form-id", // مقدار پیش‌فرض
}: BaseFormLayoutProps) {
  const { closeTab, activeTabId } = useTabs();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      closeTab(activeTabId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300 relative">
      {" "}
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0 gap-4 shadow-sm">
        {" "}
        <div className="flex items-center gap-3 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="h-8 w-8 shrink-0"
          >
            <ArrowRight size={18} />
          </Button>
          <h1 className="text-base font-bold text-foreground truncate">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-muted/10 custom-scrollbar">
        {isLoading ? (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>در حال بارگذاری اطلاعات...</p>
          </div>
        ) : (
          <div className="p-4 w-full h-full">
            {onSubmit ? (
              // فرم با ID مشخص که دکمه‌های هدر بتوانند آن را صدا بزنند
              <form
                id={formId}
                onSubmit={onSubmit}
                className="h-full flex flex-col gap-4"
              >
                {children}
              </form>
            ) : (
              <div className="h-full flex flex-col gap-4">{children}</div>
            )}
          </div>
        )}
      </div>
      {/* Footer حذف شد */}
    </div>
  );
}
