"use client";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { MENU_ITEMS } from "@/config/menuItems";
import SidebarItem from "./SidebarItem";
import { usePermissions } from "@/providers/PermissionProvider";

// این اینترفیس باید export شود تا در جاهای دیگر شناخته شود
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const { loading } = usePermissions();

  // اگر هنوز پرمیشن‌ها لود نشده‌اند، می‌توانیم اسکلتون نشان دهیم یا نال
  // اما نال برگرداندن ممکن است باعث پرش شود، پس بهتر است ساختار را رندر کنیم ولی منوها را نه
  
  return (
    <>
      {/* Overlay موبایل */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside 
        className={clsx(
          "fixed right-0 top-0 z-40 h-screen border-l border-gray-200 bg-white transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64" 
        )}
      >
        {/* Header */}
        <div className={clsx(
          "flex h-16 items-center border-b border-gray-200 bg-blue-700 px-4 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {isCollapsed ? (
             <span className="text-xl font-bold text-white">E</span> 
          ) : (
             <h1 className="text-xl font-bold text-white whitespace-nowrap">سامانه ERP</h1>
          )}
          <button onClick={onClose} className="text-white md:hidden"><X size={24} /></button>
        </div>

        {/* دکمه تغییر حالت */}
        <button 
          onClick={toggleCollapse}
          className="absolute -left-3 top-20 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-100 md:flex"
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