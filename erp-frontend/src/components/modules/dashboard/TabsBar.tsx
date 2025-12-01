"use client";

import { useTabs } from "@/providers/TabsProvider";
import { X, Home } from "lucide-react";
import { clsx } from "clsx";
import React from "react";

export default function TabsBar() {
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-end gap-0.5 overflow-x-auto bg-background border-b border-border px-1 pt-0 scrollbar-hide">
      {/* Home/Dashboard Tab */}
      <button
        onClick={() => setActiveTab("/")}
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
        <div
          key={tab.id}
          className={clsx(
            "group flex items-center gap-1 px-3 py-3 text-xs font-medium rounded-t-lg",
            "transition-all duration-200 cursor-pointer min-w-fit max-w-[200px] select-none",
            "relative border-b-2",
            "hover:bg-muted/40",
            activeTabId === tab.id
              ? "text-primary bg-muted/30 border-b-primary shadow-sm"
              : "text-muted-foreground border-b-transparent hover:text-foreground"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {/* Tab Title */}
          <span className="truncate flex-1 px-1">{tab.title}</span>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className={clsx(
              "flex-shrink-0 p-1 rounded-md transition-all duration-150",
              "opacity-0 group-hover:opacity-100",
              "hover:bg-destructive/15 hover:text-destructive",
              "text-muted-foreground hover:text-destructive"
            )}
            title="بستن تب"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}