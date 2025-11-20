"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell, UserCircle, Menu } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx"; // این را اضافه کنید

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean; // <--- پراپ جدید
}

export default function Header({ onMenuClick, isCollapsed }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.info("از سیستم خارج شدید");
    router.push("/login");
  };

  return (
    <header 
      className={clsx(
        "fixed left-0 top-0 z-30 w-full border-b border-gray-200 bg-white px-4 py-3 shadow-sm transition-all duration-300 ease-in-out",
        // لاجیک تغییر عرض در دسکتاپ (md):
        // اگر جمع شده (w-20 = 5rem): عرض کل منهای 5rem
        // اگر باز است (w-64 = 16rem): عرض کل منهای 16rem
        isCollapsed ? "md:w-[calc(100%-5rem)]" : "md:w-[calc(100%-16rem)]"
      )}
    >
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <Menu size={24} />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-700">پیشخوان</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="hidden items-center gap-2 border-r border-gray-300 pr-4 sm:flex">
            <UserCircle size={24} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">مدیر سیستم</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}