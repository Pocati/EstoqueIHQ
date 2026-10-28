export type UnitMeasure = 'ML' | 'TESTS';
export type StockStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type ManufacturerBrand = 'Dako / Agilent' | 'Roche' | 'Outro';

export type ScreenRoute = 'HOME' | 'STOCK' | 'ORDERS' | 'REGISTER';

export const ML_BOX_OPTIONS = ['12 mL', '20 mL', '40 mL', '45 mL'] as const;
export const TESTS_BOX_OPTIONS = ['50 testes', '250 testes'] as const;

export interface ReagentItem {
  id: string;
  name: string;
  clone: string;
  code: string;
  manufacturer: ManufacturerBrand | string;
  volume: string; // Ex: "12 mL", "20 mL", "40 mL", "45 mL", "50 testes", "250 testes"
  unit: UnitMeasure;
  monthlyConsumption: number; // Em caixas
  minStock3Months: number;    // Em caixas
  currentStock: number;       // Em caixas
  coverageDays: number;
  suggestedOrderQty: number;  // Em caixas
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

export interface UpdateReagentPayload {
  name: string;
  clone: string;
  code: string;
  manufacturer: string;
  volume: string;
  unit: UnitMeasure;
  monthlyConsumption: number;
  currentStock: number;
}
