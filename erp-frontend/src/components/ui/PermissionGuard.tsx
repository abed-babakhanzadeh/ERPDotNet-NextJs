"use client";

import { usePermissions } from "@/providers/PermissionProvider";

interface Props {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: Props) {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return null; // اگر دسترسی نداشت، هیچی رندر نکن (مخفی شو)
}