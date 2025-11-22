export interface Unit {
  id: number;
  title: string;
  symbol: string;
  conversionFactor: number;
  baseUnitName?: string; // چون در DTO بک‌‌اند این را برمی‌گرداندیم
}