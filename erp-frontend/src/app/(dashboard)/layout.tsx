"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/modules/dashboard/Sidebar";
import Header from "@/components/modules/dashboard/Header";
import TabsBar from "@/components/modules/dashboard/TabsBar";
import { PermissionProvider } from "@/providers/PermissionProvider";
import { TabsProvider } from "@/providers/TabsProvider";
import { clsx } from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // وضعیت‌های سایدبار
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // موبایل (باز/بسته)
  const [isCollapsed, setIsCollapsed] = useState(false); // دسکتاپ (جمع/باز)

  // چک کردن لاگین (Auth Guard)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <PermissionProvider>
      <TabsProvider>
        <div className="min-h-screen bg-gray-50 flex">
        {/* سایدبار هوشمند */}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isCollapsed} 
            toggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />

          {/* محتوای اصلی (که عرضش با سایدبار تنظیم می‌شود) */}
          <div
            className={clsx(
              "flex-1 flex flex-col min-h-screen transition-all duration-300",
              // در دسکتاپ (md): اگر جمع شده margin-right=20, اگر باز است margin-right=64
              // در موبایل: margin-right=0
              isCollapsed ? "md:mr-20" : "md:mr-64"
            )}
          >
            {/* هدر ثابت */}
            <Header
              onMenuClick={() => setIsSidebarOpen(true)}
              isCollapsed={isCollapsed}
            />

            {/* نوار تب‌ها (زیر هدر قرار می‌گیرد) */}
            <div className="pt-16 sticky top-0 z-20 bg-gray-50">
              <TabsBar />
            </div>

            {/* کانتینر محتوای صفحات */}
            {/* bg-white/50 برای زیبایی بیشتر روی بک‌گراند خاکستری */}
            <main className="p-4 flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </TabsProvider>
    </PermissionProvider>
  );
}
