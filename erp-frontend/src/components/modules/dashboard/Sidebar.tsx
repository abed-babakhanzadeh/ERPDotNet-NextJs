"use client";

import { X, Menu, ChevronRight, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";
import { MENU_ITEMS } from "@/config/menuItems";
import SidebarItemWrapper from "./SidebarItemWrapper";
import { usePermissions } from "@/providers/PermissionProvider";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
}: SidebarProps) {
  const { loading } = usePermissions();

  return (
    <>
      {/* Overlay موبایل */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-opacity md:hidden"
        />
      )}

      <aside
        className={clsx(
          "fixed right-0 top-0 z-40 h-screen border-l border-border bg-card transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
          "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-border bg-primary px-4 justify-between gap-2">
          {/* دکمه toggle - در سمت چپ (left side) */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground transition-all duration-200 hover:scale-110 order-last"
            title={isCollapsed ? "باز کردن" : "بستن"}
          >
            {isCollapsed ? (
              <Menu size={18} className="stroke-[2.5]" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </button>
          {/* عنوان */}
          <div className="flex items-center gap-3 flex-1">
            {isCollapsed ? (
              <span className="text-xl font-bold text-primary-foreground">
                E
              </span>
            ) : (
              <h1 className="text-lg font-bold text-primary-foreground whitespace-nowrap">
                سامانه ERP
              </h1>
            )}
          </div>
          {/* بستن موبایل */}
          <button
            onClick={onClose}
            className="text-primary-foreground md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* لیست منو */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto py-4 px-3 custom-scrollbar">
          {!loading && (
            <nav className="space-y-1">
              {MENU_ITEMS.map((item, index) => (
                <SidebarItemWrapper
                  key={index}
                  item={item}
                  isCollapsed={isCollapsed}
                  onCollapsedIconClick={toggleCollapse}
                />
              ))}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
}
