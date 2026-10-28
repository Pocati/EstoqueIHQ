export type UnitMeasure = 'ML' | 'TESTS';
export type StockStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type ManufacturerBrand = 'Dako / Agilent' | 'Roche' | 'Outro';

export type ScreenRoute = 'HOME' | 'STOCK' | 'ORDERS' | 'REGISTER';

export const ML_BOX_OPTIONS = ['12 ml', '20 ml', '40 ml', '45 ml'] as const;
export const TESTS_BOX_OPTIONS = ['50', '250'] as const;

export interface ReagentItem {
  id: string;
  name: string;
  clone: string;
  code: string;
  manufacturer: ManufacturerBrand | string;
  volume: string;             // "12 ml", "20 ml", "40 ml", "45 ml" ou "50", "250"
  unit: UnitMeasure;          // 'ML' | 'TESTS'
  monthlyConsumption: number; // Em mL ou Testes consumidos por mês
  minStock3Months: number;    // Consumo de 3 meses em mL ou Testes
  currentStock: number;       // Quantidade em estoque em CAIXAS
  coverageDays: number;       // Dias de cobertura calculados convertendo caixas -> mL/testes
  suggestedOrderQty: number;  // Quantidade a pedir em CAIXAS
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
