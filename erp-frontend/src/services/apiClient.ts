import axios from 'axios';

// ⚠️ مهم: پورت زیر را با پورت پروژه .NET خودتان ست کنید (همانی که در Scalar دیدید)
const API_BASE_URL = 'http://localhost:5249/api'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -- Request Interceptor --
// قبل از اینکه درخواست از مرورگر خارج شود، این تابع اجرا می‌شود
apiClient.interceptors.request.use(
  (config) => {
    // دریافت توکن از حافظه مرورگر
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // چسباندن توکن به هدر Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -- Response Interceptor --
// وقتی جواب از سرور می‌آید، این تابع اجرا می‌شود
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // اگر خطای 401 (Unauthorized) گرفتیم، یعنی توکن منقضی شده
    if (error.response && error.response.status === 401) {
      // اینجا می‌توانیم کاربر را به صفحه لاگین پرت کنیم
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;