"use client";

import { useTabs } from "@/providers/TabsProvider";
import { X, Home } from "lucide-react";
import { clsx } from "clsx";

export default function TabsBar() {
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    // تغییر bg-gray-100 به bg-muted/20 و border-gray-300 به border-border
    <div className="flex items-end gap-1 overflow-x-auto bg-muted/20 px-2 pt-2 scrollbar-hide">
      
      <button
        onClick={() => setActiveTab("/")}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-x transition-all select-none",
          activeTabId === "/"
            // تب فعال: رنگ پس‌زمینه اصلی (card) و متن اصلی (primary)
            ? "bg-background border-border text-primary border-b-background -mb-[1px] z-10"
            // تب غیرفعال: رنگ پس‌زمینه muted
            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Home size={14} />
        پیشخوان
      </button>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={clsx(
            "group flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-x transition-all cursor-pointer min-w-[120px] justify-between select-none",
            activeTabId === tab.id
              ? "bg-background border-border text-foreground border-b-background -mb-[1px] z-10 shadow-sm"
              : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate max-w-[100px]">{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className={clsx(
                "p-0.5 rounded-full transition-opacity opacity-0 group-hover:opacity-100",
                "hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}