import { LayoutDashboard, Users, Settings, Package, FileText, BarChart, Shield } from "lucide-react";

export interface MenuItem {
  title: string;
  href?: string; // اگر فرزند داشته باشد، href نال است
  icon: any;
  permission?: string;
  submenu?: MenuItem[]; // فرزندان (بازگشتی)
}

export const MENU_ITEMS: MenuItem[] = [
  { 
    title: "داشبورد", 
    href: "/", 
    icon: LayoutDashboard 
  },
{ 
    title: "مدیریت کاربران", 
    href: "/users", 
    icon: Users, 
    permission: "UserAccess" 
  },
  // === اضافه شد ===
  { 
    title: "مدیریت نقش‌ها", 
    href: "/roles", 
    icon: Shield, // آیکون سپر (Shield) را ایمپورت کنید
    permission: "UserAccess.Roles" 
  },
  { 
    title: "تنظیمات", 
    href: "/settings", 
    icon: Settings, 
    permission: "System.Settings" 
  },
];