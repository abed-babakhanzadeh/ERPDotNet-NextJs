import axios from "axios";

// خواندن از متغیر محیطی با مقدار پیش‌فرض
// ما /api را اینجا اضافه می‌کنیم تا در فایل env فقط آدرس سرور باشد
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // فقط اگر در محیط مرورگر هستیم
      if (typeof window !== "undefined") {
        // اگر همین الان در صفحه لاگین هستیم، کاری نکن (جلوگیری از لوپ)
        if (window.location.pathname === "/login") {
          return Promise.reject(error);
        }

        // در غیر این صورت، توکن را پاک کن و برو به لاگین
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
