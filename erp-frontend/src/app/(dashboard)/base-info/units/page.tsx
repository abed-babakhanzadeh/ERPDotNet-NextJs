"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { Unit } from "@/types/baseInfo";
import { Plus, Ruler } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateUnitForm from "./CreateUnitForm";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUnits = async () => {
    // setLoading(true); // برای تجربه بهتر UX، لودینگ کل صفحه را نزنیم
    try {
      const { data } = await apiClient.get<Unit[]>("/Units");
      setUnits(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <ProtectedPage permission="BaseInfo.Units">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Ruler className="text-blue-600" />
            واحد سنجش
          </h1>
          
          <PermissionGuard permission="BaseInfo.Units.Create">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              واحد جدید
            </button>
          </PermissionGuard>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-right text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
              <tr>
                <th className="px-6 py-3">عنوان</th>
                <th className="px-6 py-3">نماد</th>
                <th className="px-6 py-3">رابطه (ضریب)</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{unit.title}</td>
                  <td className="px-6 py-4 font-mono text-xs bg-gray-50 w-fit rounded px-2">{unit.symbol}</td>
                  <td className="px-6 py-4">
                    {unit.baseUnitName ? (
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                        1 {unit.title} = {unit.conversionFactor} {unit.baseUnitName}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">واحد اصلی</span>
                    )}
                  </td>
                </tr>
              ))}
              {units.length === 0 && !loading && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-400">هیچ واحدی تعریف نشده است</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تعریف واحد سنجش">
          <CreateUnitForm 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchUnits();
            }}
          />
        </Modal>
      </div>
    </ProtectedPage>
  );
}