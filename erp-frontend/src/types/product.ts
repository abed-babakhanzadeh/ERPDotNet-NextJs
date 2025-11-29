export interface Product {
  id: number;
  code: string;
  name: string;
  unitId: number;
  unitName: string;
  supplyTypeId: number;
  supplyType: string;
  conversions: ProductConversion[];
}

export interface ProductConversion {
  id: number;
  alternativeUnitId: number;
  alternativeUnitName: string;
  factor: number;
}
