"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/modules/dashboard/AppSidebar";
import TabsBar from "@/components/modules/dashboard/TabsBar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />

      <SidebarInset className="bg-background">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 backdrop-blur px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-mr-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-sm font-semibold text-muted-foreground hidden sm:block">
              پیشخوان سیستم
            </h1>
          </div>

          {/* --- بخش اعلانات در هدر --- */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {/* نشانگر قرمز تعداد اعلان (نمونه) */}
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 border border-background"></span>
            </Button>
          </div>
          {/* ------------------------- */}
        </header>

        <div className="sticky top-14 z-10 bg-background/95 backdrop-blur border-b shadow-sm">
          <TabsBar />
        </div>

        <main className="flex-1 flex flex-col overflow-hidden bg-muted/10 p-4">
          <div className="flex-1 h-full min-h-0 relative">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
