"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell, UserCircle, Menu } from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { ModeToggle } from "@/components/theme/ModeToggle"; // ایمپورت دکمه تم

interface HeaderProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
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
        // تغییر bg-white به bg-card و border-gray-200 به border-border
        "fixed left-0 top-0 z-30 w-full border-b border-border bg-card px-4 py-3 shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "md:w-[calc(100%-5rem)]" : "md:w-[calc(100%-16rem)]"
      )}
    >
      <div className="flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            // تغییر رنگ‌های هاور به حالت پویا
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
          >
            <Menu size={24} />
          </button>
          
          <h2 className="text-lg font-semibold text-foreground">پیشخوان</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* دکمه تغییر تم اینجا اضافه شد */}
          <ModeToggle />

          <button className="relative text-muted-foreground hover:text-foreground">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-destructive"></span>
          </button>

          <div className="hidden items-center gap-2 border-r border-border pr-4 sm:flex">
            <UserCircle size={24} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">مدیر سیستم</span>
          </div>

          <button 
            onClick={handleLogout}
            // استفاده از رنگ‌های destructive برای دکمه خروج
            className="flex items-center gap-1 rounded-md bg-destructive/10 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/20"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}