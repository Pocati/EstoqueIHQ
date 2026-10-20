export type UnitMeasure = 'ML' | 'TESTS';
export type StockStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type ManufacturerBrand = 'Dako / Agilent' | 'Roche' | 'Outro';

export type ScreenRoute = 'HOME' | 'STOCK' | 'ORDERS' | 'REGISTER';

export interface ReagentItem {
  id: string;
  name: string;
  clone: string;
  code: string;
  manufacturer: ManufacturerBrand | string;
  volume: string;
  unit: UnitMeasure;
  monthlyConsumption: number;
  minStock3Months: number;
  currentStock: number;
  coverageDays: number;
  suggestedOrderQty: number;
  status: StockStatus;
}

export interface CreateReagentPayload {
  name: string;
  clone: string;
  code?: string;
  manufacturer?: string;
  volume?: string;
  unit?: UnitMeasure;
  monthlyConsumption?: number;
  currentStock?: number;
}
