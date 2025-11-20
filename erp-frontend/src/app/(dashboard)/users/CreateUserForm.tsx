"use client";

import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import { User } from "@/types/user";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  userToEdit?: User | null; // <--- پراپ جدید (اختیاری)
}

export default function CreateUserForm({ onSuccess, onCancel, userToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  
  // State اولیه
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", username: "",
    email: "", personnelCode: "", password: "",
    role: "User", isActive: true
  });

  // اگر userToEdit وجود داشت، فرم را پر کن (useEffect)
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        username: userToEdit.username,
        email: userToEdit.email,
        personnelCode: userToEdit.personnelCode,
        password: "", // در ویرایش پسورد خالی می‌ماند
        role: userToEdit.roles?.[0] || "User", // اولین نقش را برمی‌دارد
        isActive: userToEdit.isActive
      });
    }
  }, [userToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // هندل کردن چک‌باکس با بقیه فرق دارد
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userToEdit) {
        // === حالت ویرایش (PUT) ===
        // فیلدهای اضافه مثل password (اگر خالیه) رو حذف می‌کنیم یا بک‌‌اند نادیده می‌گیره
        // اما چون DTO ویرایش Password نداره، بهتره نفرستیم. اما اینجا ساده ارسال می‌کنیم.
        await apiClient.put(`/Users/${userToEdit.id}`, formData);
        toast.success("کاربر ویرایش شد");
      } else {
        // === حالت ایجاد (POST) ===
        await apiClient.post("/Users", formData);
        toast.success("کاربر جدید اضافه شد");
      }
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data || "خطا در عملیات";
      toast.error(typeof msg === 'string' ? msg : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* سطر اول */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
          <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
          <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 outline-none" />
        </div>
      </div>

      {/* سطر دوم */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
          {/* در ویرایش نام کاربری قفل است */}
          <input required disabled={!!userToEdit} name="username" value={formData.username} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm disabled:bg-gray-100 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
          <input name="personnelCode" value={formData.personnelCode || ""} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      {/* سطر سوم: ایمیل و نقش */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نقش</label>
          <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none bg-white">
             <option value="Admin">مدیر سیستم</option>
             <option value="User">کاربر عادی</option>
             <option value="Accountant">حسابدار</option>
             <option value="WarehouseKeeper">انباردار</option>
          </select>
        </div>
      </div>

      {/* سطر چهارم: پسورد (فقط در ایجاد) و وضعیت */}
      <div className="grid grid-cols-2 gap-4 items-center">
        {!userToEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
          </div>
        )}
        
        {/* چک باکس وضعیت (فقط در ویرایش نمایش داده شود بهتر است) */}
        <div className="flex items-center gap-2 pt-6">
          <input 
            type="checkbox" 
            id="isActive" 
            name="isActive" 
            checked={formData.isActive} 
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 select-none">حساب کاربری فعال باشد</label>
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">انصراف</button>
        <button disabled={loading} type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? "در حال ذخیره..." : (userToEdit ? "ویرایش کاربر" : "ثبت کاربر")}
        </button>
      </div>
    </form>
  );
}