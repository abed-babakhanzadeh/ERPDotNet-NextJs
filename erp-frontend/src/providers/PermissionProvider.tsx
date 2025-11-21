"use client";

import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { Loader2 } from "lucide-react";

interface PermissionContextType {
  permissions: string[];
  loading: boolean;
  hasPermission: (permissionName: string) => boolean;
  hasPermissionGroup: (prefix: string) => boolean; // <--- تابع جدید
}
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // دانلود مجوزها به محض لود شدن داشبورد
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data } = await apiClient.get<string[]>("/Permissions/mine");
        setPermissions(data);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        // اگر خطا داد (مثلا توکن سوخت)، لیست خالی می‌شود
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

// تابع کمکی برای چک کردن دسترسی
  const hasPermission = (permissionName: string) => {
    return permissions.includes(permissionName);
  };

  // === تابع جدید: چک کردن گروهی ===
  // مثال: اگر ورودی "UserAccess" باشد، و کاربر "UserAccess.View" داشته باشد، True برمی‌گرداند.
  const hasPermissionGroup = (prefix: string) => {
    return permissions.some(p => p === prefix || p.startsWith(prefix + "."));
  };


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">در حال دریافت مجوزها...</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionContext.Provider value={{ permissions, loading, hasPermission, hasPermissionGroup }}>
      {children}
    </PermissionContext.Provider>
  );  
} 

// هوک اختصاصی برای استفاده راحت‌تر
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};