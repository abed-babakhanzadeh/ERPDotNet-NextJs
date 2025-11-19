"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { User } from "@/types/user";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import Modal from "@/components/ui/Modal"; // <--- اضافه شد
import CreateUserForm from "./CreateUserForm"; // <--- اضافه شد

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <--- State مدال

  const fetchUsers = async () => {
    try {
      // setLoading(true); // برای تجربه بهتر، موقع رفرش دوباره لودینگ نزنیم بهتره
      const { data } = await apiClient.get<User[]>("/Users");
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)} // <--- باز کردن مدال
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          افزودن کاربر جدید
        </button>
      </div>

      {/* ... بخش جستجو و جدول (بدون تغییر) ... */}
      {/* ... کدهای قبلی جدول ... */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* کد جدول مثل قبل */}
             <table className="w-full text-right text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">نام و نام خانوادگی</th>
                  <th className="px-6 py-3">نام کاربری</th>
                  <th className="px-6 py-3">کد پرسنلی</th>
                  <th className="px-6 py-3">وضعیت</th>
                  <th className="px-6 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.personnelCode || "-"}</td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          فعال
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
      </div>

      {/* مودال افزودن کاربر */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="افزودن کاربر جدید"
      >
        <CreateUserForm 
          onCancel={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchUsers(); // رفرش کردن جدول
          }} 
        />
      </Modal>

    </div>
  );
}