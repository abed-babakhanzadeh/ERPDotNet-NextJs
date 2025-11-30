"use client";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { MENU_ITEMS } from "@/config/menuItems";
import SidebarItem from "./SidebarItem";
import { usePermissions } from "@/providers/PermissionProvider";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const { loading } = usePermissions();

  return (
    <>
      {/* Overlay موبایل */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside 
        className={clsx(
          // تغییر bg-white به bg-card و border-gray-200 به border-border
          "fixed right-0 top-0 z-40 h-screen border-l border-border bg-card transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64" 
        )}
      >
        {/* Header - تغییر bg-blue-700 به bg-primary برای هماهنگی با تم */}
        <div className={clsx(
          "flex h-16 items-center border-b border-border bg-primary px-4 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {isCollapsed ? (
             <span className="text-xl font-bold text-primary-foreground">E</span> 
          ) : (
             <h1 className="text-xl font-bold text-primary-foreground whitespace-nowrap">سامانه ERP</h1>
          )}
          <button onClick={onClose} className="text-primary-foreground md:hidden"><X size={24} /></button>
        </div>

        {/* دکمه تغییر حالت */}
        <button 
          onClick={toggleCollapse}
          // تغییر رنگ دکمه کلاپس به رنگ‌های تم
          className="absolute -left-3 top-20 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md hover:bg-accent hover:text-accent-foreground md:flex"
        >
          {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* لیست منو */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 custom-scrollbar">
          {!loading && (
            <nav className="space-y-1">
              {MENU_ITEMS.map((item, index) => (
                <SidebarItem 
                  key={index} 
                  item={item} 
                  isCollapsed={isCollapsed} 
                />
              ))}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}