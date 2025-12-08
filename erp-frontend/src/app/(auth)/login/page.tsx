"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { Lock, User, Loader2 } from "lucide-react"; // آیکون‌ها

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. ارسال درخواست به سرور دات‌نت
      const { data } = await apiClient.post("/Auth/login", formData);

      // 2. ذخیره توکن دریافت شده
      localStorage.setItem("accessToken", data.token);

      // 3. نمایش پیام موفقیت
      toast.success("خوش آمدید!", {
        description: "ورود شما با موفقیت انجام شد.",
      });

      // 4. هدایت به داشبورد (که در مرحله بعد می‌سازیم)
      // فعلا به صفحه اصلی می‌رود چون هنوز داشبورد نداریم
      router.push("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMessage =
        error.response?.data || "نام کاربری یا رمز عبور اشتباه است";
      toast.error("خطای ورود", {
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : "ارتباط با سرور برقرار نشد",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="bg-blue-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">ورود به سامانه ERP</h1>
          <p className="mt-2 text-sm text-blue-100">
            لطفاً مشخصات کاربری خود را وارد کنید
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 pt-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                نام کاربری
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                  placeholder="مثال: admin"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                رمز عبور
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  در حال پردازش...
                </>
              ) : (
                "ورود به سیستم"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            نسخه ۱۰.۰ - توسعه داده شده با .NET & Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
