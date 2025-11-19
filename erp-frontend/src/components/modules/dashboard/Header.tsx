"use client";

import { useRouter } from "next/navigation";
import { LogOut, Bell, UserCircle } from "lucide-react";
import { toast } from "sonner";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    // پاک کردن توکن
    localStorage.removeItem("accessToken");
    toast.info("از سیستم خارج شدید");
    router.push("/login");
  };

  return (
    <header className="fixed left-0 top-0 z-30 w-[calc(100%-16rem)] border-b border-gray-200 bg-white px-6 py-3 shadow-sm max-md:w-full">
      <div className="flex items-center justify-between">
        
        {/* Right Side: Breadcrumb or Title */}
        <h2 className="text-lg font-semibold text-gray-700">پیشخوان مدیریت</h2>

        {/* Left Side: User Actions */}
        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
            <UserCircle size={24} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">مدیر سیستم</span>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-100"
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}