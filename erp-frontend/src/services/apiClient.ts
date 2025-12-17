import axios from "axios";

// اولویت با متغیر محیطی است، اگر نبود لوکال‌هاست
// در پروداکشن این مقدار برابر http://94.182.39.201:5000 خواهد بود
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// حذف اسلش اضافه انتهای آدرس اگر وجود داشته باشد
const cleanBaseUrl = API_URL.replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: `${cleanBaseUrl}/api`, // اضافه کردن /api به انتهای آدرس
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // بررسی وجود ویندو برای جلوگیری از خطا در SSR
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        // جلوگیری از لوپ در صفحه لاگین
        if (!window.location.pathname.includes("/login")) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;