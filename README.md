# Sistema de Controle de Estoque IHQ (Ciclo de 3 Meses)

Sistema web Full Stack (React + TypeScript + `styled-components` no Frontend e Node.js + Express + Prisma ORM no Backend) projetado para eliminar rupturas de estoque em laboratórios de **Imunoistoquímica (IHQ)**.

## Funcionalidades Implementadas
- **Menu Principal Minimalista (`Home`)**: Acesso rápido a **Ver Estoque**, **Ver Pedidos** e **Cadastrar Reagentes**, com indicadores visuais de itens críticos e pontos de pedido.
- **Tela 1 — Cadastrar Reagente (`ReagentForm`)**: Campos técnicos de IHQ (Nome do anticorpo/insumo, Fabricante, Clone/Catálogo, Apresentação RTU/Concentrado/Kit/Tampão, Lote, Validade, Consumo Mensal) e cálculo em tempo real da **Autonomia de 3 Meses**.
- **Tela 2 — Ver Estoque (`InventoryList`)**:
  - Semáforo automático: 🟢 **Normal** (> 45 dias), 🟡 **Atenção / Ponto de Pedido** (30 a 45 dias ou abaixo da meta de 90 dias) e 🔴 **Crítico** (< 30 dias de cobertura ou lote próximo ao vencimento).
  - Baixa rápida de consumo diário aplicando **FEFO** (*First Expired, First Out* — desconta automaticamente do lote que vence primeiro).
  - Entrada rápida de novo lote com rastreabilidade.
- **Tela 3 — Ver Pedidos (`OrdersPanel`)**:
  - Sugestão automática baseada na fórmula: $\text{Quantidade a Pedir} = (\text{Consumo Médio Mensal} \times 3) - \text{Estoque Atual}$.
  - Fluxo de status: `Pendente` → `Cotado` → `Aguardando Entrega` → `Recebido` (ao marcar como **Recebido**, solicita o Lote e Validade e abastece o estoque automaticamente).

## Como Executar

### 1. Backend (API + Prisma ORM)
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
```
A API ficará disponível em `http://localhost:3333/api`.

### 2. Frontend (React + Vite + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
Acesse no navegador em `http://localhost:5173`.
