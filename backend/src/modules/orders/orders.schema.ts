import { z } from 'zod';

export const createOrderSchema = z.object({
  reagentId: z.string().min(1, 'ID do reagente é obrigatório'),
  orderedQuantity: z.number().positive('A quantidade a pedir deve ser maior que zero'),
  supplierNotes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'QUOTED', 'AWAITING_DELIVERY', 'RECEIVED', 'CANCELED']),
  supplierNotes: z.string().optional(),
  // Obrigatórios quando o status muda para RECEIVED (alimenta o estoque automaticamente)
  lotNumber: z.string().optional(),
  expirationDate: z.string().optional(),
});
