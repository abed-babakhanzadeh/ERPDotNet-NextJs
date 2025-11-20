"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Package, X, ChevronRight, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";

const menuItems = [
  { name: "داشبورد", href: "/", icon: LayoutDashboard },
  { name: "مدیریت کاربران", href: "/users", icon: Users },
  { name: "انبارداری", href: "/inventory", icon: Package },
  { name: "تنظیمات", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;      // وضعیت باز بودن در موبایل
  onClose: () => void;  // تابع بستن در موبایل
  isCollapsed: boolean; // وضعیت جمع شدن در دسکتاپ (جدید)
  toggleCollapse: () => void; // تابع تغییر وضعیت دسکتاپ (جدید)
}

export default function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname();

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
          // لاجیک موبایل (مثل قبل)
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          // لاجیک دسکتاپ: عرض متغیر
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64" // عرض پیش‌فرض در موبایل همیشه کامل است
        )}
      >
        {/* Header / Logo */}
        <div className={clsx(
          "flex h-16 items-center border-b border-gray-200 bg-blue-700 px-4 transition-all",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {/* لوگو یا متن */}
          {isCollapsed ? (
             <span className="text-xl font-bold text-white">E</span> // لوگوی کوچک
          ) : (
             <h1 className="text-xl font-bold text-white whitespace-nowrap">سامانه ERP</h1>
          )}
          
          {/* دکمه بستن موبایل */}
          <button onClick={onClose} className="text-white md:hidden">
            <X size={24} />
          </button>
        </div>

        {/* دکمه تغییر حالت (فقط در دسکتاپ دیده شود) */}
        <button 
          onClick={toggleCollapse}
          className="absolute -left-3 top-20 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-100 md:flex"
        >
          {isCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Menu Items */}
        <div className="h-full overflow-y-auto py-4 px-3">
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()} // بستن در موبایل
                    className={clsx(
                      "flex items-center rounded-lg p-3 transition-colors hover:bg-gray-100",
                      isActive ? "bg-blue-50 text-blue-700" : "text-gray-900",
                      isCollapsed ? "justify-center" : ""
                    )}
                    title={isCollapsed ? item.name : ""} // تولتیپ ساده وقتی جمع شده
                  >
                    <item.icon size={22} className={clsx(isActive ? "text-blue-700" : "text-gray-500", "shrink-0")} />
                    
                    {/* متن منو */}
                    <span className={clsx(
                      "mr-3 transition-all duration-300 whitespace-nowrap overflow-hidden",
                      isCollapsed ? "w-0 opacity-0 md:hidden" : "w-auto opacity-100"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}