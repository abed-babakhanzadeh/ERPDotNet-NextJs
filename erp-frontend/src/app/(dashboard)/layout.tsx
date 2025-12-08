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
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={clsx(
          "relative flex flex-1 flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "md:mr-16" : "md:mr-64"
        )}
      >
        {/* Header - 32px */}
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          isCollapsed={isCollapsed}
        />

        {/* Main Container - pt-8 برای جا دادن Header */}
        <main className="flex-1 pt-12 flex flex-col overflow-hidden">
          {/* TabsBar - sticky در بالا */}
          <div className="sticky pt-2 top-0 z-40 bg-background">
            <TabsBar />
          </div>

          {/* Content Area - فضای باقیمانده با اسکرول */}
          <div className="flex-1 min-h-0 overflow-auto bg-muted/5 p-1 md:p-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
