"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * هوک عمومی برای prefetch کردن آدرس‌هایی که می‌دانیم کاربر
 * به احتمال زیاد به زودی آن‌ها را باز می‌کند (مثل صفحات ایجاد).
 *
 * این کار باعث می‌شود تب‌ها هنگام باز شدن بسیار سریع‌تر لود شوند،
 * بدون این‌که لازم باشد در هر صفحه منطق prefetch را تکرار کنیم.
 */
export function useTabPrefetch(urls: string[]) {
  const router = useRouter();

  useEffect(() => {
    if (!urls || urls.length === 0) return;

    urls.forEach((url) => {
      try {
        // @ts-expect-error: در نوع Router ممکن است prefetch به‌صورت اختیاری تعریف شده باشد
        router.prefetch?.(url);
      } catch {
        // prefetch اختیاری است؛ در صورت خطا چیزی لاگ نمی‌کنیم
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, JSON.stringify(urls)]);
}


