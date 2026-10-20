import { z } from 'zod';

export const createReagentSchema = z.object({
  name: z.string().min(1, 'Nome do reagente é obrigatório'),
  clone: z.string().min(1, 'Clone é obrigatório'),
  code: z.string().optional().default(''),
  manufacturer: z.string().optional().default('Dako / Agilent'),
  volume: z.string().optional().default(''),
  unit: z.enum(['ML', 'TESTS']).optional().default('ML'),
  monthlyConsumption: z.number().nonnegative().optional().default(0),
  currentStock: z.number().nonnegative().optional().default(0),
});

export const adjustStockSchema = z.object({
  delta: z.number(), // Ex: +1 ou -1
});
