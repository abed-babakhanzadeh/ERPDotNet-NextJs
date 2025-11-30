import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CustomThemeProvider } from "@/providers/CustomThemeProvider";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
// اضافه کردن ایمپورت‌های جدید
import { PermissionProvider } from "@/providers/PermissionProvider";
import { TabsProvider } from "@/providers/TabsProvider";

export const metadata: Metadata = {
  title: "ERP System",
  description: "سیستم جامع مدیریت منابع سازمانی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'custom']}
        >
          <CustomThemeProvider>
            {/* اضافه کردن PermissionProvider و TabsProvider در لایه بیرونی */}
            <PermissionProvider>
              <TabsProvider>
                
                {children}
                
                {/* ابزارهای شناور */}
                <ThemeCustomizer />
                <Toaster position="top-center" richColors />
                
              </TabsProvider>
            </PermissionProvider>
          </CustomThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}