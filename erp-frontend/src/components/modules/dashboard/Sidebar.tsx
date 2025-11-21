"use client";

import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { MENU_ITEMS, MenuItem } from "@/config/menuItems";
import SidebarItem from "./SidebarItem";
import { usePermissions } from "@/providers/PermissionProvider";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
const { hasPermission, hasPermissionGroup } = usePermissions(); // <--- تابع جدید را بگیرید

  const checkVisibility = (item: MenuItem): boolean => {
    // 1. بررسی هوشمند دسترسی مستقیم
    let hasDirectAccess = true;
    
    if (item.permission) {
      // تغییر مهم: به جای hasPermission از hasPermissionGroup استفاده می‌کنیم
      // این باعث می‌شود اگر پدر تیک نداشت ولی فرزندانش داشتند، پدر دیده شود.
      hasDirectAccess = hasPermissionGroup(item.permission);
    }

    // 2. بررسی فرزندان (برای منوهای آکاردئونی)
    const hasChildAccess = item.submenu 
      ? item.submenu.some(sub => checkVisibility(sub)) 
      : false;

    // نکته: اگر آیتم آکاردئونی باشد (submenu دارد)، منطق hasChildAccess مهم‌تر است.
    // اما اگر آیتم لینک‌دار باشد (مثل مدیریت کاربران)، hasDirectAccess مهم است.
    if (item.submenu) {
        return hasChildAccess;
    }
    
    return hasDirectAccess;
  };

  // فیلتر کردن منوی اصلی بر اساس تابع بالا (فقط یک بار تعریف شده)
  const visibleMenuItems = MENU_ITEMS.filter(checkVisibility);

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
          // لاجیک موبایل
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          // لاجیک دسکتاپ
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64" 
        )}
      >
        {/* Header / Logo */}
        <div className={clsx(
          "flex h-16 items-center border-b border-gray-200 bg-blue-700 px-4 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {isCollapsed ? (
             <span className="text-xl font-bold text-white">E</span> 
          ) : (
             <h1 className="text-xl font-bold text-white whitespace-nowrap">سامانه ERP</h1>
          )}
          
          <button onClick={onClose} className="text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* دکمه تغییر حالت (فقط در دسکتاپ) */}
        <button 
          onClick={toggleCollapse}
          className="absolute -left-3 top-20 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-100 md:flex"
        >
          {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Menu Items */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 custom-scrollbar">
          <nav className="space-y-1">
            {visibleMenuItems.map((item, index) => (
              <SidebarItem 
                key={index} 
                item={item} 
                isCollapsed={isCollapsed} 
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}