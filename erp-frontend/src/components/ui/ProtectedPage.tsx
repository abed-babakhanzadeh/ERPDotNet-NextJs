"use client";

import { usePermissions } from "@/providers/PermissionProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  permission: string; // نام مجوزی که برای دیدن این صفحه لازم است
  children: React.ReactNode;
}

export default function ProtectedPage({ permission, children }: Props) {
  const { hasPermission, loading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    // صبر می‌کنیم تا لودینگ تمام شود، بعد چک می‌کنیم
    if (!loading && !hasPermission(permission)) {
      toast.error("شما مجوز دسترسی به این بخش را ندارید.");
      router.push("/"); // هدایت به داشبورد اصلی
    }
  }, [loading, hasPermission, permission, router]);

  // حالت ۱: در حال دریافت مجوزها از سرور
  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-sm">در حال اعتبارسنجی دسترسی...</span>
        </div>
      </div>
    );
  }

  // حالت ۲: لودینگ تمام شده اما مجوز ندارد (محتوا را رندر نکن تا ریدایرکت انجام شود)
  if (!hasPermission(permission)) {
    return null;
  }

  // حالت ۳: مجوز دارد -> محتوا را نشان بده
  return <>{children}</>;
}