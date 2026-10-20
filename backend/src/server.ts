import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { routes } from './routes';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🚀 API Controle de Estoque IHQ rodando em http://localhost:${PORT}/api`);
});
