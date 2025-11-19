"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/modules/dashboard/Sidebar";
import Header from "@/components/modules/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Auth Guard: چک کردن اینکه آیا کاربر لاگین است؟
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* منوی راست */}
      <Sidebar />

      {/* محتوای اصلی */}
      <div className="mr-64 min-h-screen pt-16 transition-all max-md:mr-0">
        <Header />
        
        {/* اینجا صفحات مختلف رندر می‌شوند */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}