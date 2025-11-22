export interface ProductConversionDto {
  alternativeUnitName: string;
  factor: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  unitName: string;
  supplyType: string;
  conversions: ProductConversionDto[]; // <--- فیلد جدید
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