"use client";

import React, { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BaseFormLayout from "@/components/layout/BaseFormLayout";

export interface MasterDetailTab {
  key: string;
  label: string;
  content: ReactNode;
  icon?: React.ElementType;
}

interface MasterDetailFormProps {
  title: string;
  headerContent: ReactNode;
  tabs: MasterDetailTab[];
  isLoading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitting?: boolean;
  formId?: string;
  headerActions?: ReactNode;
}

export default function MasterDetailForm({
  title,
  headerContent,
  tabs,
  isLoading,
  onSubmit,
  onCancel,
  submitting,
  formId = "master-detail-form",
  headerActions,
}: MasterDetailFormProps) {
  return (
    <BaseFormLayout
      title={title}
      isLoading={isLoading}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isSubmitting={submitting}
      formId={formId}
      headerActions={headerActions}
    >
      <div className="flex flex-col gap-6 h-full">
        {/* 1. Header Section */}
        {/* جهت هدر را هم صراحتا راست‌چین میکنیم */}
        <div className="bg-card border rounded-lg p-5 shadow-sm" dir="rtl">
          {headerContent}
        </div>

        {/* 2. Details Section (Tabs) */}
        <div className="flex-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
          {/* تغییر ۱: اضافه کردن dir="rtl" به کامپوننت Tabs */}
          <Tabs
            defaultValue={tabs[0]?.key}
            className="flex flex-col h-full"
            dir="rtl"
          >
            <div className="border-b px-4 bg-muted/20">
              {/* تغییر ۲: استفاده از justify-start که در حالت RTL یعنی شروع از راست */}
              <TabsList className="bg-transparent h-12 p-0 gap-6 w-full justify-start">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon && <tab.icon className="w-4 h-4" />}
                      {tab.label}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-zinc-950">
              {tabs.map((tab) => (
                <TabsContent
                  key={tab.key}
                  value={tab.key}
                  className="h-full m-0 p-4 data-[state=inactive]:hidden"
                >
                  {tab.content}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </BaseFormLayout>
  );
}
