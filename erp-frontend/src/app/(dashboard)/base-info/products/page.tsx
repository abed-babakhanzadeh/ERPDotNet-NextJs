"use client";

import { Fragment, useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { Product } from "@/types/product";
import { Plus, Package, ChevronDown, ChevronRight, Box } from "lucide-react"; // آیکون‌های جدید
import ProtectedPage from "@/components/ui/ProtectedPage";
import PermissionGuard from "@/components/ui/PermissionGuard";
import Modal from "@/components/ui/Modal";
import CreateProductForm from "./CreateProductForm";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State برای نگهداری آیدی سطرهای باز شده
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

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

  // تابع تغییر وضعیت باز/بسته بودن سطر
  const toggleRow = (id: number) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

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
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-6 py-3">کد کالا</th>
                  <th className="px-6 py-3">نام کالا</th>
                  <th className="px-6 py-3">واحد اصلی</th>
                  <th className="px-6 py-3">نوع</th>
                  <th className="px-6 py-3">واحدهای فرعی</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isExpanded = expandedRows.includes(product.id);
                  const hasConversions = product.conversions && product.conversions.length > 0;

                  return (
                    // تغییر مهم: استفاده از Fragment برای دادن Key به کل گروه
                    <Fragment key={product.id}> 
                      
                      {/* سطر اصلی (key را از اینجا حذف کنید چون به Fragment دادیم) */}
                      <tr 
                        className={`border-b transition cursor-pointer ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                        onClick={() => hasConversions && toggleRow(product.id)}
                      >
                        <td className="px-4 py-4 text-center">
                          {hasConversions ? (
                            <button className="text-gray-400 hover:text-blue-600">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          ) : (
                            <span className="block w-4 h-4 rounded-full bg-gray-100 mx-auto"></span>
                          )}
                        </td>
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
                            {hasConversions ? (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                    {product.conversions.length} واحد فرعی
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400">-</span>
                            )}
                        </td>
                      </tr>

                      {/* سطر جزئیات */}
                      {isExpanded && hasConversions && (
                        <tr className="bg-gray-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <td colSpan={6} className="px-4 py-4 border-b">
                            <div className="mr-10 flex gap-4 overflow-x-auto">
                              {product.conversions.map((conv, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm min-w-[200px]">
                                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                                    <Box size={20} />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">فرمول تبدیل</p>
                                    <p className="text-sm font-bold text-gray-800">
                                      1 {conv.alternativeUnitName} = {conv.factor} {product.unitName}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment> 
                  );
                })}
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