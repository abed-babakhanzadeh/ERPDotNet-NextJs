import { LayoutDashboard, Users, Settings, Shield, Layers, Grid, Package } from "lucide-react"; // آیکون Layers یا Grid برای عمومی خوبه
import { Database, Ruler } from "lucide-react";

export interface MenuItem {
  title: string;
  href?: string;
  icon: any;
  permission?: string;
  submenu?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  { 
    title: "داشبورد", 
    href: "/", 
    icon: LayoutDashboard 
  },
  
  // === گروه عمومی (Accordion) ===
  {
    title: "عمومی",
    icon: Layers, // آیکون پیشنهادی
    permission: "General", // باید با نامی که در دیتابیس (Id=100) دادیم یکی باشد
    submenu: [
      { 
        title: "مدیریت کاربران", 
        href: "/users", 
        icon: Users, 
        permission: "UserAccess" 
      },
      { 
        title: "مدیریت نقش‌ها", 
        href: "/roles", 
        icon: Shield, 
        permission: "UserAccess.Roles" 
      },
      { 
        title: "تنظیمات", 
        href: "/settings", 
        icon: Settings, 
        permission: "General.Settings" 
      },
    ]
  },


  {
      title: "اطلاعات پایه",
      icon: Database,
      permission: "BaseInfo",
      submenu: [
        { 
          title: "واحد سنجش", 
          href: "/base-info/units", 
          icon: Ruler, 
          permission: "BaseInfo.Units" 
        },
        // بعداً کالاها اینجا میاد
      ]
    },

    { 
        title: "مدیریت کالاها", 
        href: "/base-info/products", 
        icon: Package, // ایمپورت کنید
        permission: "BaseInfo.Products" 
      },

  // === بعدا انبار اینجا میاد ===
  /*
  {
    title: "انبارداری",
    icon: Package,
    permission: "Inventory",
    submenu: [...]
  }
  */
];