import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { createOrderSchema, updateOrderStatusSchema } from './orders.schema';
import { ReagentsService } from '../reagents/reagents.service';

const reagentsService = new ReagentsService();

export class OrdersService {
  /**
   * Lista tanto os pedidos ativos/histórico quanto as sugestões automáticas de compra
   * baseadas na fórmula: Quantidade a Pedir = (Consumo Médio Mensal * 3) - Estoque Atual
   */
  async listOrdersAndSuggestions() {
    const [orders, enrichedReagents] = await Promise.all([
      prisma.order.findMany({
        include: { reagent: true },
        orderBy: { createdAt: 'desc' },
      }),
      reagentsService.listAll(),
    ]);

    // Reagentes que já possuem pedido aberto (PENDING, QUOTED ou AWAITING_DELIVERY)
    const activeOrderReagentIds = new Set(
      orders
        .filter((o) => ['PENDING', 'QUOTED', 'AWAITING_DELIVERY'].includes(o.status))
        .map((o) => o.reagentId)
    );

    // Sugestões automáticas: itens com suggestedOrderQty > 0 ou status != NORMAL sem pedido aberto
    const suggestions = enrichedReagents
      .filter(
        (r) =>
          (r.suggestedOrderQty > 0 || r.status !== 'NORMAL') && !activeOrderReagentIds.has(r.id)
      )
      .map((r) => ({
        reagentId: r.id,
        reagentName: r.name,
        manufacturer: r.manufacturer,
        cloneOrCode: r.cloneOrCode,
        unit: r.unit,
        monthlyConsumption: r.monthlyConsumption,
        minStock3Months: r.minStock3Months,
        currentStock: r.currentStock,
        coverageDays: r.coverageDays,
        status: r.status,
        statusReason: r.statusReason,
        // Fórmula exata solicitada: (Consumo Médio Mensal * 3) - Estoque Atual
        suggestedQuantity:
          r.suggestedOrderQty > 0
            ? r.suggestedOrderQty
            : Number((r.monthlyConsumption * 3).toFixed(2)),
      }));

    return {
      suggestions,
      orders,
    };
  }

  async createOrder(data: z.infer<typeof createOrderSchema>) {
    const reagent = await prisma.reagent.findUnique({
      where: { id: data.reagentId },
      include: { batches: { where: { isActive: true } } },
    });

    if (!reagent) {
      throw new Error('Reagente não encontrado');
    }

    const currentStock = reagent.batches.reduce((sum, b) => sum + b.currentQuantity, 0);
    const suggestedQuantity = Math.max(
      0,
      Number((reagent.monthlyConsumption * 3 - currentStock).toFixed(2))
    );

    return prisma.order.create({
      data: {
        reagentId: data.reagentId,
        suggestedQuantity: suggestedQuantity > 0 ? suggestedQuantity : data.orderedQuantity,
        orderedQuantity: data.orderedQuantity,
        status: 'PENDING',
        supplierNotes: data.supplierNotes || null,
      },
      include: { reagent: true },
    });
  }

  /**
   * Atualiza o status do pedido.
   * Ao marcar como RECEIVED, alimenta automaticamente a tabela Batch e registra Movement (IN).
   */
  async updateStatus(orderId: string, payload: z.infer<typeof updateOrderStatusSchema>) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { reagent: true },
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    if (order.status === 'RECEIVED') {
      throw new Error('Este pedido já foi recebido e incorporado ao estoque.');
    }

    if (payload.status === 'RECEIVED') {
      if (!payload.lotNumber?.trim() || !payload.expirationDate?.trim()) {
        throw new Error(
          'Para marcar como RECEBIDO e abastecer o estoque, informe o Número do Lote e a Data de Validade.'
        );
      }

      await reagentsService.addBatch(order.reagentId, {
        lotNumber: payload.lotNumber.trim().toUpperCase(),
        expirationDate: payload.expirationDate,
        initialQuantity: order.orderedQuantity,
        notes: `Recebimento automático do Pedido #${order.id.slice(0, 6).toUpperCase()}`,
      });
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: payload.status,
        supplierNotes:
          payload.supplierNotes !== undefined ? payload.supplierNotes : order.supplierNotes,
        receivedAt: payload.status === 'RECEIVED' ? new Date() : order.receivedAt,
      },
      include: { reagent: true },
    });
  }
}
