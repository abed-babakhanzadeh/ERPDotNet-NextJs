export interface ProductConversionDto {
  id: number;                // شناسه برای ویرایش
  alternativeUnitId: number; // شناسه واحد برای دراپ‌داون
  alternativeUnitName: string;
  factor: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  
  // فیلدهای نمایشی (برای گرید)
  unitName: string;
  supplyType: string;

  // فیلدهای ویرایشی (برای فرم)
  unitId: number;        // <--- جدید
  supplyTypeId: number;  // <--- جدید
  
  conversions: ProductConversionDto[];
}

// این برای فرم ثبت است (ساختار ورودی به API)
export interface ProductFormInput {
  code: string;
  name: string;
  technicalSpec: string;
  unitId: string | number;
  supplyType: number; // 1, 2, 3
  conversions: ProductConversionInput[];
}

export interface ProductConversionInput {
  alternativeUnitId: string | number;
  factor: number;
}