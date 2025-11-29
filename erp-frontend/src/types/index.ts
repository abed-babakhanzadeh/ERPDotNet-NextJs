import type { Product as ProductType } from './product';

export type Unit = {
  id: number;
  title: string;
  symbol: string;
  precision: number;
  isActive: boolean;
  baseUnitId?: number;
  conversionFactor: number;
  baseUnitName?: string;
};

export type Product = ProductType;

export type SortConfig = {
  key: keyof Unit | keyof Product;
  direction: 'ascending' | 'descending';
} | null;

export type FilterCondition = {
  id: string;
  operator: string;
  value: any;
  value2?: any; // For between operator
};

export type ColumnFilter = {
  key: keyof Unit | keyof Product;
  logic: 'and' | 'or';
  conditions: FilterCondition[];
};

export type ColumnConfig = {
  key: keyof Unit | keyof Product;
  label: string;
  type: 'string' | 'number' | 'boolean';
};
