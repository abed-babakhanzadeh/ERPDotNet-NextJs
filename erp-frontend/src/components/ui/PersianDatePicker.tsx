"use client";

import React from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PersianDatePickerProps {
  value?: string | Date | null;
  onChange: (date: string | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  hasError?: boolean;
}

export default function PersianDatePicker({
  value,
  onChange,
  label,
  placeholder = "انتخاب تاریخ...",
  disabled = false,
  required = false,
  className,
  hasError,
}: PersianDatePickerProps) {
  // تبدیل مقدار ورودی (میلادی) به فرمت مناسب برای تقویم
  const dateValue = React.useMemo(() => {
    if (!value) return null;
    return new Date(value.toString());
  }, [value]);

  const handleChange = (date: DateObject | DateObject[] | null) => {
    if (!date) {
      onChange(null);
      return;
    }

    // تبدیل تاریخ انتخاب شده (که آبجکت است) به رشته استاندارد میلادی
    // اگر تک انتخاب باشد، date یک DateObject است
    if (date instanceof DateObject) {
      // تنظیم ساعت روی 12 ظهر برای جلوگیری از جابجایی روز به خاطر تایم‌زون
      // یا استفاده از toDate() ساده. اینجا ساده‌ترین حالت ISO را می‌فرستیم.
      onChange(date.toDate().toISOString());
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        disabled={disabled}
        editable={false} // جلوگیری از تایپ دستی برای کاهش خطا
        containerClassName="w-full"
        render={(value: any, openCalendar: any) => {
          return (
            <div
              onClick={!disabled ? openCalendar : undefined}
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-colors",
                disabled && "cursor-not-allowed opacity-50 bg-muted",
                hasError && "border-destructive ring-destructive",
                !value && "text-muted-foreground"
              )}
            >
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <CalendarIcon className="h-4 w-4 opacity-50 shrink-0" />
                <span className="truncate pt-1">{value || placeholder}</span>
              </div>

              {/* دکمه پاک کردن تاریخ */}
              {!disabled && value && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                  className="hover:bg-muted rounded-full p-1 transition-colors"
                >
                  <X className="h-3 w-3 opacity-50" />
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
