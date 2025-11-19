import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
// اضافه کردن فونت‌ها یا کلاس‌های کمکی اگر دارید (مثلا clsx)

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
    <html lang="fa" dir="rtl">
      {/* تغییر این خط مهم است: اضافه کردن کلاس‌های رنگ پس‌زمینه و متن اینجا */}
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}