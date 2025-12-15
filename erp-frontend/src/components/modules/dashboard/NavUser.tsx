"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  Laptop,
  User,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import apiClient from "@/services/apiClient";

// تایپ اطلاعات دریافتی از سرور
interface UserProfileDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatarPath?: string;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const router = useRouter();

  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);

  // دریافت اطلاعات کاربر
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await apiClient.get<UserProfileDto>(
          "/UserAccess/Auth/profile"
        );
        setUser(data);
      } catch (error) {
        console.error("خطا در دریافت پروفایل", error);
        // اگر توکن منقضی شده باشد، اینترسپتور apiClient معمولا ریدارکت می‌کند
        // اما محض احتیاط اگر ارور 401 بود لاگ اوت کنیم
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // تابع خروج
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    // اگر چیزهای دیگری هم ذخیره کردید پاک کنید
    router.push("/login"); // یا router.replace
  };

  // ساخت حروف اول اسم (مثلاً "علی رضایی" -> "عر")
  const getInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // اگر دیتا نیامد (مثلا ارور خورد) یک چیز پیش‌فرض نشان بده
  const displayName = user?.fullName || user?.username || "کاربر مهمان";
  const displayEmail = user?.email || "user@erp.local";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatarPath} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-right text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {displayEmail}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-right">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatarPath} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="size-4" />
                پروفایل کاربری
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>تغییر پوسته</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => setTheme("light")}
                      className="gap-2 cursor-pointer"
                    >
                      <Sun className="size-4" /> روشن
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("dark")}
                      className="gap-2 cursor-pointer"
                    >
                      <Moon className="size-4" /> تیره
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("system")}
                      className="gap-2 cursor-pointer"
                    >
                      <Laptop className="size-4" /> سیستم
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* دکمه خروج */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 text-destructive focus:text-destructive cursor-pointer bg-red-50 dark:bg-red-950/30"
            >
              <LogOut className="size-4" />
              خروج از حساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
