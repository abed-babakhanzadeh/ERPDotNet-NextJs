"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Package, LogOut } from "lucide-react";
import { clsx } from "clsx"; // برای مدیریت کلاس‌های شرطی

const menuItems = [
  { name: "داشبورد", href: "/", icon: LayoutDashboard },
  { name: "مدیریت کاربران", href: "/users", icon: Users },
  { name: "انبارداری", href: "/inventory", icon: Package },
  { name: "تنظیمات", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-64 border-l border-gray-200 bg-white transition-transform max-md:translate-x-full">
      {/* Logo Area */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-blue-700">
        <h1 className="text-xl font-bold text-white">سامانه ERP</h1>
      </div>

      {/* Menu Items */}
      <div className="h-full overflow-y-auto px-3 py-4">
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center rounded-lg p-3 transition-colors hover:bg-gray-100",
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-900"
                  )}
                >
                  <item.icon size={22} className={clsx(isActive ? "text-blue-700" : "text-gray-500")} />
                  <span className="mr-3">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Footer / Version */}
      <div className="absolute bottom-0 w-full border-t p-4 text-center text-xs text-gray-400">
        نسخه ۱.۰.۰
      </div>
    </aside>
  );
}