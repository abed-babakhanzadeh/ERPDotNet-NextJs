"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/modules/dashboard/Sidebar";
import Header from "@/components/modules/dashboard/Header";
import { clsx } from "clsx"; // برای مدیریت کلاس‌ها
import { PermissionProvider } from "@/providers/PermissionProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // موبایل
  const [isCollapsed, setIsCollapsed] = useState(false);     // دسکتاپ (جدید)

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <PermissionProvider>
      <div className="min-h-screen bg-gray-50">
        
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isCollapsed} 
          toggleCollapse={() => setIsCollapsed(!isCollapsed)} // تابع تغییر وضعیت
        />

        {/* تغییر مهم: فاصله مارجین (md:mr) باید دینامیک باشد 
          اگر جمع شده: mr-20 (80px)
          اگر باز است: mr-64 (256px)
        */}
        <div className={clsx(
          "min-h-screen pt-16 transition-all duration-300",
          isCollapsed ? "md:mr-20" : "md:mr-64" 
        )}>
          
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)} 
            isCollapsed={isCollapsed} // <--- این خط اضافه شد
          />
          
          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}