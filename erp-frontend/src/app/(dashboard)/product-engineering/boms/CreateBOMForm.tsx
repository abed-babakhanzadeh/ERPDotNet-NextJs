"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableLookupCombobox,
  type ColumnDef,
} from "@/components/ui/TableLookupCombobox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

interface ProductOption {
  id: number;
  code: string;
  name: string;
  unitName: string;
  supplyType: string;
}

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateBOMForm({ onCancel, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    version: "1.0",
    type: "1",
  });

  // دریافت محصولات
  const handleProductSearch = useCallback(async (searchTerm: string) => {
    setProductLoading(true);
    try {
      const response = await apiClient.post<any>("/Products/search", {
        pageNumber: 1,
        pageSize: 100,
        searchTerm: (searchTerm || "").toLowerCase(),
        sortColumn: "code",
        sortDescending: false,
        Filters: [],
      });

      if (response?.data?.items) {
        const mapped: ProductOption[] = response.data.items.map(
          (item: any) => ({
            id: item.id,
            code: item.code || "",
            name: item.name || "",
            unitName: item.unitName || "",
            supplyType: item.supplyType || "",
          })
        );
        setProducts(mapped);
      }
    } catch (error) {
      console.error("خطا در دریافت محصولات:", error);
      toast.error("خطا در دریافت محصولات");
    } finally {
      setProductLoading(false);
    }
  }, []);

  const productColumns: ColumnDef[] = [
    // Use a flexible middle column for the product name so the popup
    // becomes responsive on narrow/mobile viewports. The TableLookupCombobox
    // treats these width strings as CSS grid track values, so we can use
    // `minmax(0, 1fr)` to allow the name column to shrink gracefully.
    { key: "code", label: "کد", width: "100px" },
    { key: "name", label: "نام", width: "minmax(0, 1fr)" },
    { key: "unitName", label: "واحد", width: "80px" },
    { key: "supplyType", label: "نوع تامین", width: "100px" },
  ];

  const renderProductCell = (item: ProductOption, column: ColumnDef) => {
    if (column.key === "supplyType" || column.key === "unitName") {
      return (
        <Badge
          variant={column.key === "supplyType" ? "outline" : "secondary"}
          className="text-xs"
        >
          {item[column.key as keyof ProductOption]}
        </Badge>
      );
    }
    return (
      <span>{String(item[column.key as keyof ProductOption] ?? "—")}</span>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("لطفاً محصول را انتخاب کنید");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post("/BOMs", {
        productId: Number(formData.productId),
        title: formData.title,
        version: formData.version,
        type: Number(formData.type),
      });

      toast.success("فرمول ساخت با موفقیت ایجاد شد");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("خطا در ایجاد فرمول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* انتخاب محصول */}
        <div className="space-y-2">
          <Label>کد محصول</Label>
          <TableLookupCombobox<ProductOption>
            value={selectedProduct?.id || null}
            onValueChange={(productId, product) => {
              setSelectedProduct(product || null);
              setFormData({
                ...formData,
                productId: productId ? String(productId) : "",
              });
            }}
            columns={productColumns}
            items={products}
            loading={productLoading}
            placeholder="جستجو برای محصول..."
            searchableFields={["code", "name", "unitName", "supplyType"]}
            displayFields={["code", "name"]}
            onSearch={handleProductSearch}
            renderCell={renderProductCell}
          />
        </div>

        <div className="space-y-2">
          <Label>عنوان فرمول</Label>
          <Input
            placeholder="مثلاً: فرمول استاندارد تابستان"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>نسخه</Label>
          <Input
            value={formData.version}
            onChange={(e) =>
              setFormData({ ...formData, version: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>نوع BOM</Label>
          <Select
            defaultValue="1"
            onValueChange={(val) => setFormData({ ...formData, type: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">تولیدی (Manufacturing)</SelectItem>
              <SelectItem value="2">مهندسی (Engineering)</SelectItem>
              <SelectItem value="3">فروش (Sales)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t mt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          انصراف
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت فرمول"}
        </Button>
      </div>
    </form>
  );
}
