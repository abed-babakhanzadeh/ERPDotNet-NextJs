"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/modules/dashboard/Sidebar";
import Header from "@/components/modules/dashboard/Header";
import TabsBar from "@/components/modules/dashboard/TabsBar";
import { clsx } from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    // تغییر ۱: حذف bg-gray-50 و استفاده از bg-background text-foreground
    // استفاده از h-screen و overflow-hidden برای جلوگیری از اسکرول کل صفحه
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed} 
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        className={clsx(
          "relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300",
          isCollapsed ? "md:mr-20" : "md:mr-64"
        )}
      >
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isCollapsed={isCollapsed}
        />

        <main className="flex-1 pt-16 flex flex-col">
          {/* تغییر ۲: استایل‌دهی کانتینر تب‌ها با رنگ‌های تم */}
          <div className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsBar />
          </div>

          {/* تغییر ۳: حذف هرگونه bg-white اضافی */}
          <div className="flex-1 p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}