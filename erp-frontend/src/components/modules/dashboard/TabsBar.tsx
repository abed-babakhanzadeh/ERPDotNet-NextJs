"use client";

import { useTabs } from "@/providers/TabsProvider";
import { X, Home } from "lucide-react";
import { clsx } from "clsx";
import React, { useCallback, memo } from "react";

// مموایز کردن آیتم تب برای جلوگیری از رندر غیر ضروری
const TabItem = memo(function TabItem({
  tab,
  isActive,
  onSetActive,
  onClose,
}: {
  tab: { id: string; title: string; url: string };
  isActive: boolean;
  onSetActive: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Middle click (button 1) = بستن تب
    if (e.button === 1) {
      e.preventDefault();
      onClose(tab.id);
    }
    // Left click (button 0) = فعال‌کردن تب
    else if (e.button === 0) {
      onSetActive(tab.id);
    }
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClose(tab.id);
  };

  return (
    <div
      className={clsx(
        "group flex items-center gap-1 px-3 py-3 text-xs font-medium rounded-t-lg",
        "transition-all duration-200 cursor-pointer min-w-fit max-w-[200px] select-none",
        "relative border-b-2",
        "hover:bg-muted/40",
        isActive
          ? "text-primary bg-muted/30 border-b-primary shadow-sm"
          : "text-muted-foreground border-b-transparent hover:text-foreground"
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Tab Title */}
      <span className="truncate flex-1 px-1">{tab.title}</span>

      {/* Close Button */}
      <button
        onMouseDown={handleCloseClick}
        className={clsx(
          "flex-shrink-0 p-1 rounded-md transition-all duration-150",
          "opacity-0 group-hover:opacity-100",
          "hover:bg-destructive/15 hover:text-destructive",
          "text-muted-foreground hover:text-destructive"
        )}
        title="بستن تب (یا Middle Click)"
      >
        <X size={14} />
      </button>
    </div>
  );
});

export default function TabsBar() {
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabs();

  // استفاده از useCallback برای جلوگیری از ایجاد توابع جدید
  const handleSetActive = useCallback((id: string) => {
    setActiveTab(id);
  }, [setActiveTab]);

  const handleCloseTab = useCallback((id: string) => {
    closeTab(id);
  }, [closeTab]);

  const handleHomeClick = useCallback(() => {
    setActiveTab("/");
  }, [setActiveTab]);

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-end gap-0.5 overflow-x-auto bg-background border-b border-border px-1 pt-0 scrollbar-hide">
      {/* Home/Dashboard Tab */}
      <button
        onClick={handleHomeClick}
        className={clsx(
          "flex items-center gap-2 px-4 py-3 text-xs font-medium rounded-t-lg",
          "transition-all duration-200 select-none relative group",
          "hover:bg-muted/60",
          activeTabId === "/"
            ? "text-primary bg-muted/30 border-b-2 border-primary"
            : "text-muted-foreground border-b-2 border-transparent"
        )}
      >
        <Home size={16} className="flex-shrink-0" />
        <span className="hidden sm:inline">پیشخوان</span>
      </button>

      {/* Open Tabs */}
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={activeTabId === tab.id}
          onSetActive={handleSetActive}
          onClose={handleCloseTab}
        />
      ))}
    </div>
  );
}