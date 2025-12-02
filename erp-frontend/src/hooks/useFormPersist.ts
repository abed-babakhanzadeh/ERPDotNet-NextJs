import { useEffect } from "react";

export function useFormPersist(
  key: string,
  formData: any,
  setFormData: (data: any) => void
) {
  // 1. لود کردن اطلاعات هنگام باز شدن صفحه
  useEffect(() => {
    const savedData = localStorage.getItem(key);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // ترکیب دیتای ذخیره شده با دیتای پیش‌فرض (برای جلوگیری از حذف فیلدهای جدید)
        setFormData((prev: any) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }
  }, [key, setFormData]);

  // 2. ذخیره اطلاعات هر بار که formData تغییر کرد
  useEffect(() => {
    if (formData) {
      // تاخیر کوچک برای جلوگیری از ذخیره زیاد (Debounce ساده)
      const handler = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(formData));
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [formData, key]);

  // تابع برای پاک کردن حافظه بعد از ثبت موفق
  const clearStorage = () => {
    localStorage.removeItem(key);
  };

  return { clearStorage };
}
