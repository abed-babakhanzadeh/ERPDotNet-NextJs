"use client";

import { useState } from "react";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateUserForm({ onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", username: "",
    email: "", personnelCode: "", password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/Users", formData);
      toast.success("کاربر جدید اضافه شد");
      onSuccess(); // بستن مدال و رفرش لیست
    } catch (error: any) {
      const msg = error.response?.data || "خطا در ثبت کاربر";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
          <input required name="firstName" onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
          <input required name="lastName" onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نام کاربری</label>
          <input required name="username" onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
          <input name="personnelCode" onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
        <input required type="email" name="email" onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
        <input required type="password" name="password" onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">انصراف</button>
        <button disabled={loading} type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
          {loading ? "در حال ثبت..." : "ثبت کاربر"}
        </button>
      </div>
    </form>
  );
}