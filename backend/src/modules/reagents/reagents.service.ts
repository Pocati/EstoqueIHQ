import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { adjustStockSchema, createReagentSchema } from './reagents.schema';

export type StockStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export class ReagentsService {
  private enrichReagent(reagent: any) {
    const currentStock = Number((reagent.currentStock ?? 0).toFixed(2));
    const monthlyConsumption = Number((reagent.monthlyConsumption ?? 0).toFixed(2));
    const minStock3Months = Number((monthlyConsumption * 3).toFixed(2));

    const coverageDays =
      monthlyConsumption > 0 ? Math.round((currentStock / monthlyConsumption) * 30) : 90;

    const suggestedOrderQty = Math.max(
      0,
      Number((minStock3Months - currentStock).toFixed(2))
    );

    let status: StockStatus = 'NORMAL';
    if (monthlyConsumption > 0) {
      if (currentStock <= 0 || coverageDays < 30) {
        status = 'CRITICAL';
      } else if (coverageDays <= 45 || currentStock < minStock3Months) {
        status = 'WARNING';
      }
    }

    return {
      id: reagent.id,
      name: reagent.name,
      clone: reagent.clone,
      code: reagent.code || '',
      manufacturer: reagent.manufacturer,
      volume: reagent.volume || '',
      unit: reagent.unit,
      monthlyConsumption,
      minStock3Months,
      currentStock,
      coverageDays,
      suggestedOrderQty,
      status,
    };
  }

  async listAll() {
    const reagents = await prisma.reagent.findMany({
      orderBy: { name: 'asc' },
    });
    return reagents.map((r) => this.enrichReagent(r));
  }

  async createReagent(data: z.infer<typeof createReagentSchema>) {
    const minStock3Months = Number(((data.monthlyConsumption || 0) * 3).toFixed(2));
    const created = await prisma.reagent.create({
      data: {
        name: data.name.trim(),
        clone: data.clone.trim(),
        code: data.code?.trim() || '',
        manufacturer: data.manufacturer || 'Dako / Agilent',
        volume: data.volume?.trim() || '',
        unit: data.unit || 'ML',
        monthlyConsumption: data.monthlyConsumption || 0,
        minStock3Months,
        currentStock: data.currentStock || 0,
      },
    });
    return this.enrichReagent(created);
  }

  async adjustStock(reagentId: string, payload: z.infer<typeof adjustStockSchema>) {
    const reagent = await prisma.reagent.findUnique({ where: { id: reagentId } });
    if (!reagent) {
      throw new Error('Reagente não encontrado');
    }

    const nextStock = Math.max(0, Number((reagent.currentStock + payload.delta).toFixed(2)));
    const updated = await prisma.reagent.update({
      where: { id: reagentId },
      data: { currentStock: nextStock },
    });

    return this.enrichReagent(updated);
  }
}
