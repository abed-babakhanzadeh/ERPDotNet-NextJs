// مسیر فایل: src/core/theme.ts

export const theme = {
    colors: {
      primary: '#2563eb', // رنگ آبی اصلی سایت
      primaryForeground: '#ffffff',
      background: '#ffffff',
      foreground: '#0f172a', // رنگ متن اصلی (تیره)
      card: '#ffffff',
      cardForeground: '#0f172a',
      muted: '#f1f5f9', // رنگ پس‌زمینه خاکستری روشن
      mutedForeground: '#64748b', // رنگ متن‌های فرعی (کد کالا و...)
      border: '#e2e8f0', // رنگ حاشیه اینپوت‌ها
      destructive: '#ef4444', // رنگ قرمز حذف
      success: '#10b981', // رنگ سبز موفقیت
    },
    radius: 8, // گردی گوشه‌ها طبق globals.css
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    }
  };