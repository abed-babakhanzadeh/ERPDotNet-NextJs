"use client";

import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { Product } from "@/types/product";
import { Plus, Package, Search } from "lucide-react";
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateProductForm from "./CreateProductForm";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get<Product[]>("/Products");
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProtectedPage permission="BaseInfo.Products">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" />
            مدیریت کالاها
          </h1>
          
          <PermissionGuard permission="BaseInfo.Products.Create">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} />
              کالای جدید
            </button>
          </PermissionGuard>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
             <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
          ) : (
            <table className="w-full text-right text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-bold">
                <tr>
                  <th className="px-6 py-3">کد کالا</th>
                  <th className="px-6 py-3">نام کالا</th>
                  <th className="px-6 py-3">واحد اصلی</th>
                  <th className="px-6 py-3">نوع</th>
                  <th className="px-6 py-3">واحدهای فرعی</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{product.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4">{product.unitName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.supplyType === 'خریدنی' ? 'bg-green-100 text-green-700' : 
                        product.supplyType === 'تولیدی' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100'
                      }`}>
                        {product.supplyType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                        {product.conversionCount > 0 ? (
                            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                {product.conversionCount} مورد
                            </span>
                        ) : (
                            <span className="text-gray-400 text-xs">-</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تعریف کالای جدید">
          <CreateProductForm 
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchProducts();
            }}
          />
        </Modal>
      </div>
    </ProtectedPage>
  );
}