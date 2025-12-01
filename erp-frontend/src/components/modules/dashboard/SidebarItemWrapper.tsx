"use client";

import { Suspense } from "react";
import SidebarItem from "./SidebarItem";
import { MenuItem } from "@/config/menuItems";

interface Props {
  item: MenuItem;
  isCollapsed: boolean;
  level?: number;
  onCollapsedIconClick?: () => void;
}

// Wrapper component برای اطمینان از اینکه useTabs کانتکست آماده است
export default function SidebarItemWrapper({
  item,
  isCollapsed,
  level = 0,
  onCollapsedIconClick,
}: Props) {
  return (
    <Suspense fallback={null}>
      <SidebarItem
        item={item}
        isCollapsed={isCollapsed}
        level={level}
        onCollapsedIconClick={onCollapsedIconClick}
      />
    </Suspense>
  );
}
