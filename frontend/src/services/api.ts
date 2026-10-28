import {
  CreateReagentPayload,
  ReagentItem,
  StockStatus,
  UnitMeasure,
  UpdateReagentPayload,
} from '../types/ihq.types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_KEY = 'ihq_reagents_v2';

/**
 * Extrai a quantidade numérica (mL ou testes) que vem dentro de 1 caixa.
 * Ex: "12 ml" -> 12 | "50" -> 50
 */
export function parseBoxVolume(volumeStr: string, unit: UnitMeasure): number {
  const num = parseFloat(String(volumeStr || '').replace(',', '.'));
  if (!isNaN(num) && num > 0) return num;
  return unit === 'TESTS' ? 50 : 12;
}

function computeDerived(raw: {
  id: string;
  name: string;
  clone: string;
  code: string;
  manufacturer: string;
  volume: string;
  unit: UnitMeasure;
  monthlyConsumption: number;
  currentStock: number;
}): ReagentItem {
  // Consumo mensal em mL ou testes
  const monthlyInUnits = Number(raw.monthlyConsumption || 0);
  // Estoque atual em CAIXAS
  const currentBoxes = Number(raw.currentStock || 0);
  // Quantos mL ou testes vêm em cada caixa
  const unitsPerBox = parseBoxVolume(raw.volume, raw.unit);

  // Total disponível atualmente convertido para mL ou testes
  const currentStockInUnits = currentBoxes * unitsPerBox;

  // Necessidade para 3 meses (em mL ou testes)
  const minStock3MonthsInUnits = Number((monthlyInUnits * 3).toFixed(2));

  // Dias de cobertura
  const coverageDays =
    monthlyInUnits > 0 ? Math.round((currentStockInUnits / monthlyInUnits) * 30) : 90;

  // Quantos mL ou testes faltam para fechar 3 meses
  const deficitInUnits = Math.max(0, minStock3MonthsInUnits - currentStockInUnits);

  // Converte a falta em mL/testes para o número inteiro de CAIXAS a pedir
  const suggestedOrderQty =
    deficitInUnits > 0 ? Math.ceil(deficitInUnits / unitsPerBox) : 0;

  let status: StockStatus = 'NORMAL';
  if (monthlyInUnits > 0) {
    if (currentBoxes <= 0 || coverageDays < 30) {
      status = 'CRITICAL';
    } else if (coverageDays <= 45 || currentStockInUnits < minStock3MonthsInUnits) {
      status = 'WARNING';
    }
  }

  return {
    ...raw,
    monthlyConsumption: monthlyInUnits,
    currentStock: currentBoxes,
    minStock3Months: minStock3MonthsInUnits,
    coverageDays,
    suggestedOrderQty,
    status,
  };
}

function mapRowFromSupabase(row: any): ReagentItem {
  return computeDerived({
    id: row.id,
    name: row.name,
    clone: row.clone,
    code: row.code || '',
    manufacturer: row.manufacturer || 'Dako / Agilent',
    volume: row.volume || '12 ml',
    unit: (row.unit as UnitMeasure) || 'ML',
    monthlyConsumption: Number(row.monthly_consumption ?? 0),
    currentStock: Number(row.current_stock ?? 0),
  });
}

function getLocalItems(): ReagentItem[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return parsed.map(computeDerived);
  } catch {
    return [];
  }
}

function saveLocalItems(items: ReagentItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items.map(computeDerived)));
}

export const ihqApi = {
  isCloudActive: () => isSupabaseConfigured,

  async listReagents(): Promise<ReagentItem[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('reagents')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []).map(mapRowFromSupabase);
    }

    return getLocalItems();
  },

  async createReagent(payload: CreateReagentPayload): Promise<ReagentItem> {
    if (supabase) {
      const { data, error } = await supabase
        .from('reagents')
        .insert({
          name: payload.name,
          clone: payload.clone,
          code: payload.code || '',
          manufacturer: payload.manufacturer || 'Dako / Agilent',
          volume: payload.volume || '12 ml',
          unit: payload.unit || 'ML',
          monthly_consumption: payload.monthlyConsumption ?? 0,
          current_stock: payload.currentStock ?? 0,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapRowFromSupabase(data);
    }

    const items = getLocalItems();
    const newItem = computeDerived({
      id: String(Date.now()),
      name: payload.name,
      clone: payload.clone,
      code: payload.code || '',
      manufacturer: payload.manufacturer || 'Dako / Agilent',
      volume: payload.volume || '12 ml',
      unit: payload.unit || 'ML',
      monthlyConsumption: payload.monthlyConsumption ?? 0,
      currentStock: payload.currentStock ?? 0,
    });
    const next = [...items, newItem].sort((a, b) => a.name.localeCompare(b.name));
    saveLocalItems(next);
    return newItem;
  },

  async updateReagent(reagentId: string, payload: UpdateReagentPayload): Promise<ReagentItem> {
    if (supabase) {
      const { data, error } = await supabase
        .from('reagents')
        .update({
          name: payload.name,
          clone: payload.clone,
          code: payload.code || '',
          manufacturer: payload.manufacturer,
          volume: payload.volume,
          unit: payload.unit,
          monthly_consumption: payload.monthlyConsumption,
          current_stock: payload.currentStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reagentId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapRowFromSupabase(data);
    }

    const items = getLocalItems();
    const updated = items
      .map((item) => {
        if (item.id !== reagentId) return item;
        return computeDerived({
          id: reagentId,
          ...payload,
        });
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    saveLocalItems(updated);
    return updated.find((i) => i.id === reagentId)!;
  },

  async adjustStock(reagentId: string, delta: number): Promise<ReagentItem> {
    if (supabase) {
      const { data: current, error: fetchErr } = await supabase
        .from('reagents')
        .select('current_stock')
        .eq('id', reagentId)
        .single();

      if (fetchErr) throw new Error(fetchErr.message);

      const nextStock = Math.max(
        0,
        Number(((Number(current.current_stock) || 0) + delta).toFixed(2))
      );

      const { data: updated, error: updateErr } = await supabase
        .from('reagents')
        .update({
          current_stock: nextStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reagentId)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      return mapRowFromSupabase(updated);
    }

    const items = getLocalItems();
    const updated = items.map((item) => {
      if (item.id !== reagentId) return item;
      const nextStock = Math.max(0, Number((item.currentStock + delta).toFixed(2)));
      return computeDerived({ ...item, currentStock: nextStock });
    });
    saveLocalItems(updated);
    return updated.find((i) => i.id === reagentId)!;
  },

  async deleteReagent(reagentId: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('reagents').delete().eq('id', reagentId);
      if (error) throw new Error(error.message);
      return;
    }

    const items = getLocalItems().filter((i) => i.id !== reagentId);
    saveLocalItems(items);
  },
};
