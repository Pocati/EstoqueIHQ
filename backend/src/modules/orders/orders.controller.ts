import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { createOrderSchema, updateOrderStatusSchema } from './orders.schema';

const service = new OrdersService();

export class OrdersController {
  async list(req: Request, res: Response) {
    try {
      const result = await service.listOrdersAndSuggestions();
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao carregar pedidos' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = createOrderSchema.parse(req.body);
      const created = await service.createOrder(parsed);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(400).json({
        message: error.errors?.[0]?.message || error.message || 'Erro ao criar pedido',
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = updateOrderStatusSchema.parse(req.body);
      const updated = await service.updateStatus(id, parsed);
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({
        message: error.errors?.[0]?.message || error.message || 'Erro ao atualizar pedido',
      });
    }
  }
}
