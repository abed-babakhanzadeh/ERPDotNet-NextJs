export default function DashboardPage() {
  return (
    <div className="page-content space-y-6">
      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">تعداد کل کاربران</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">1,240</p>
          <span className="text-xs text-green-500">+12% نسبت به ماه قبل</span>
        </div>
        
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">سندهای ثبت شده</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">354</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">وضعیت سیستم</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">آنلاین</p>
        </div>
      </div>

      {/* بخش محتوا */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 min-h-[400px]">
        <h2 className="mb-4 text-lg font-bold text-gray-800">گزارش فعالیت‌های اخیر</h2>
        <p className="text-gray-500">به سامانه ERP خوش آمدید. از منوی سمت راست برای دسترسی به بخش‌ها استفاده کنید.</p>
      </div>
    </div>
  );
}