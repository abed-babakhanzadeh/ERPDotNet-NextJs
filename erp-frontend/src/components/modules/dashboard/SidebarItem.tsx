"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { MenuItem } from "@/config/menuItems";
import { usePermissions } from "@/providers/PermissionProvider";
import { clsx } from "clsx";

interface Props {
  item: MenuItem;
  isCollapsed: boolean;
}

export default function SidebarItem({ item, isCollapsed }: Props) {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);

  // 1. چک کردن دسترسی (اگر پرمیشن ندارد، کلا مخفی شود)
  if (item.permission && !hasPermission(item.permission)) return null;

  // 2. آیا این آیتم فعال است؟ (برای رنگ آبی)
  const isActive = item.href === pathname || item.submenu?.some(sub => sub.href === pathname);

  // حالت اول: آیتم ساده (بدون زیرمنو)
  if (!item.submenu) {
    return (
      <Link
        href={item.href!}
        className={clsx(
          "flex items-center rounded-lg p-3 my-1 transition-colors hover:bg-gray-100",
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-700",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? item.title : ""}
      >
        <item.icon size={20} className="shrink-0" />
        {!isCollapsed && <span className="mr-3 text-sm font-medium">{item.title}</span>}
      </Link>
    );
  }

  // حالت دوم: منوی کشویی (آکاردئون)
  return (
    <div className="my-1">
      <button
        onClick={() => !isCollapsed && setIsOpen(!isOpen)} // اگر جمع شده، باز نشود (یا رفتار دیگر)
        className={clsx(
          "flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-100",
          isActive ? "text-blue-700" : "text-gray-700",
          isCollapsed && "justify-center"
        )}
      >
        <div className="flex items-center">
          <item.icon size={20} className="shrink-0" />
          {!isCollapsed && <span className="mr-3 text-sm font-medium">{item.title}</span>}
        </div>
        
        {/* فلش چرخان (فقط وقتی باز است) */}
        {!isCollapsed && (
          <ChevronLeft 
            size={16} 
            className={clsx("transition-transform duration-200", isOpen && "-rotate-90")} 
          />
        )}
      </button>

      {/* محتوای زیرمنو (با انیمیشن ارتفاع) */}
      {!isCollapsed && (
        <div 
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mr-4 border-r border-gray-200 pr-2 mt-1 space-y-1">
            {item.submenu.map((sub, index) => (
              <SidebarItem key={index} item={sub} isCollapsed={false} /> // بازگشتی
            ))}
          </div>
        </div>
      )}
    </div>
  );
}