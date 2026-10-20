import { Request, Response } from 'express';
import { ReagentsService } from './reagents.service';
import { adjustStockSchema, createReagentSchema } from './reagents.schema';

const service = new ReagentsService();

export class ReagentsController {
  async list(_req: Request, res: Response) {
    try {
      const items = await service.listAll();
      return res.json(items);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao listar reagentes' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsed = createReagentSchema.parse(req.body);
      const created = await service.createReagent(parsed);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(400).json({
        message: error.errors?.[0]?.message || error.message || 'Dados inválidos no cadastro',
      });
    }
  }

  async adjustStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const parsed = adjustStockSchema.parse(req.body);
      const updated = await service.adjustStock(id, parsed);
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({
        message: error.errors?.[0]?.message || error.message || 'Erro ao ajustar estoque',
      });
    }
  }
}
