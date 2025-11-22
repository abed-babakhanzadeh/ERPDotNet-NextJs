"use client";

import { useTabs } from "@/providers/TabsProvider";
import { X, Home } from "lucide-react";
import { clsx } from "clsx";

export default function TabsBar() {
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabs();

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-end gap-1 overflow-x-auto bg-gray-100 px-2 pt-2 border-b border-gray-300 sticky top-0 z-20">
      {/* تب داشبورد (همیشه هست یا اختیاری) */}
      <button
        onClick={() => setActiveTab("/")}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-x transition-all",
          activeTabId === "/"
            ? "bg-white border-gray-300 text-blue-700 border-b-white -mb-[1px] z-10"
            : "bg-gray-200 border-transparent text-gray-500 hover:bg-gray-300"
        )}
      >
        <Home size={14} />
        پیشخوان
      </button>

      {/* سایر تب‌ها */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={clsx(
            "group flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg border-t border-x transition-all cursor-pointer min-w-[120px] justify-between",
            activeTabId === tab.id
              ? "bg-white border-gray-300 text-gray-800 border-b-white -mb-[1px] z-10 shadow-sm"
              : "bg-gray-200 border-transparent text-gray-500 hover:bg-gray-300"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="truncate">{tab.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
