"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import apiClient from "@/services/apiClient";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function CreateBOMForm({ onCancel, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    title: "",
    version: "1.0",
    type: "1" // پیش‌فرض: Manufacturing
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ارسال درخواست به اندپوینت Create
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
        
        {/* انتخاب محصول (در پروژه واقعی باید کمبوباکس سرچ‌دار باشد) */}
        <div className="space-y-2">
          <Label>کد محصول</Label>
          <Input 
             placeholder="شناسه محصول را وارد کنید"
             type="number"
             value={formData.productId}
             onChange={(e) => setFormData({...formData, productId: e.target.value})}
             required
          />
        </div>

        <div className="space-y-2">
          <Label>عنوان فرمول</Label>
          <Input 
            placeholder="مثلاً: فرمول استاندارد تابستان"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>نسخه</Label>
          <Input 
            value={formData.version}
            onChange={(e) => setFormData({...formData, version: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>نوع BOM</Label>
          <Select 
            defaultValue="1" 
            onValueChange={(val) => setFormData({...formData, type: val})}
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
        <Button variant="outline" type="button" onClick={onCancel}>انصراف</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت فرمول"}
        </Button>
      </div>
    </form>
  );
}