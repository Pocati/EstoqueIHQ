import { Router } from 'express';
import { ReagentsController } from '../modules/reagents/reagents.controller';

const routes = Router();
const reagentsController = new ReagentsController();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'IHQ Inventory API' });
});

routes.get('/reagents', (req, res) => reagentsController.list(req, res));
routes.post('/reagents', (req, res) => reagentsController.create(req, res));
routes.patch('/reagents/:id/stock', (req, res) => reagentsController.adjustStock(req, res));

export { routes };
