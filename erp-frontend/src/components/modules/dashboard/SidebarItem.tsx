"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { MenuItem } from "@/config/menuItems";
import { usePermissions } from "@/providers/PermissionProvider";
import { useTabs } from "@/providers/TabsProvider";
import { clsx } from "clsx";

interface Props {
  item: MenuItem;
  isCollapsed: boolean;
}

export default function SidebarItem({ item, isCollapsed }: Props) {
  // === خط حیاتی برای رفع ارور TypeError ===
  if (!item) return null;
  // ======================================

  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const { addTab } = useTabs();
  const [isOpen, setIsOpen] = useState(false);

  // لاجیک بررسی دسترسی
  const hasDirectAccess = item.permission ? hasPermission(item.permission) : true;
  const hasChildAccess = item.submenu?.some(sub => 
     sub && sub.permission ? hasPermission(sub.permission) : true
  );
  const isVisible = item.submenu ? (hasDirectAccess || hasChildAccess) : hasDirectAccess;

  if (!isVisible) return null;

  const isActive = item.href === pathname || item.submenu?.some(sub => sub?.href === pathname);

  const handleClick = (e: React.MouseEvent) => {
    if (item.href) {
      e.preventDefault();
      addTab(item.title, item.href);
    }
  };

  // آیتم ساده
  if (!item.submenu) {
    return (
      <a
        href={item.href!}
        onClick={handleClick}
        className={clsx(
          "flex items-center rounded-lg p-3 my-1 transition-colors hover:bg-gray-100 cursor-pointer select-none",
          isActive ? "bg-blue-50 text-blue-700" : "text-gray-700",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? item.title : ""}
      >
        <item.icon size={20} className="shrink-0" />
        {!isCollapsed && <span className="mr-3 text-sm font-medium">{item.title}</span>}
      </a>
    );
  }

  // منوی کشویی
  return (
    <div className="my-1 select-none">
      <button
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={clsx(
          "flex w-full items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-100",
          isActive ? "text-blue-700" : "text-gray-700",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? item.title : ""}
      >
        <div className="flex items-center">
          <item.icon size={20} className="shrink-0" />
          {!isCollapsed && <span className="mr-3 text-sm font-medium">{item.title}</span>}
        </div>
        
        {!isCollapsed && (
          <ChevronLeft 
            size={16} 
            className={clsx("transition-transform duration-200", isOpen && "-rotate-90")} 
          />
        )}
      </button>

      {!isCollapsed && (
        <div 
          className={clsx(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="mr-4 border-r border-gray-200 pr-2 mt-1 space-y-1">
            {item.submenu.map((sub, index) => (
              <SidebarItem key={index} item={sub} isCollapsed={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}