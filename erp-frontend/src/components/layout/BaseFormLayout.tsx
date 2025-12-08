"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BaseFormLayoutProps {
  title: string;
  isLoading?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  formId?: string;
  onCancel?: () => void;
  children: React.ReactNode;
  saveLabel?: string;
  cancelLabel?: string;
  saveDisabled?: boolean;
  hideActions?: boolean;
  saveIcon?: React.ReactNode;
  headerActions?: React.ReactNode;
}

export default function BaseFormLayout({
  title,
  isLoading = false,
  onSubmit,
  formId,
  onCancel,
  children,
  saveLabel = "ذخیره",
  cancelLabel = "انصراف",
  saveDisabled = false,
  hideActions = false,
  saveIcon,
  headerActions,
}: BaseFormLayoutProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      className="flex flex-col h-full overflow-hidden"
    >
      {/* Header فشرده */}
      <div className="flex items-center justify-between px-3 md:px-4 h-7 border-b bg-muted/50 shrink-0">
        <h2 className="text-sm font-semibold truncate">{title}</h2>

        {/* دکمه‌های هدر */}
        {!hideActions && (
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1 shrink-0">
              {headerActions ? (
                headerActions
              ) : (
                <>
                  {onCancel && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={onCancel}
                          className="h-5 w-5 hover:bg-accent rounded"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px]">
                        {cancelLabel}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {onSubmit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          form={formId}
                          variant="default"
                          size="icon"
                          disabled={saveDisabled}
                          className="h-5 w-5 rounded"
                        >
                          {saveIcon || <Save className="h-3.5 w-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px]">
                        {saveLabel}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* محتوای اصلی */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="p-3 md:p-4">{children}</div>
      </div>
    </form>
  );
}
