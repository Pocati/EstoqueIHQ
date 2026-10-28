import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ReagentItem } from '../../types/ihq.types';

interface OrdersPanelProps {
  reagents: ReagentItem[];
  onBack: () => void;
  onNavigateToStock: () => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({
  reagents,
  onBack,
  onNavigateToStock,
}) => {
  const itemsToOrder = useMemo(
    () => reagents.filter((r) => r.suggestedOrderQty > 0),
    [reagents]
  );

  const dakoOrders = useMemo(
    () =>
      itemsToOrder.filter(
        (r) =>
          r.manufacturer.toLowerCase().includes('dako') ||
          r.manufacturer.toLowerCase().includes('agilent')
      ),
    [itemsToOrder]
  );

  const rocheOrders = useMemo(
    () => itemsToOrder.filter((r) => r.manufacturer.toLowerCase().includes('roche')),
    [itemsToOrder]
  );

  const exportToExcel = (brandName: string, list: ReagentItem[]) => {
    const headers = [
      'Codigo',
      'Reagente',
      'Clone',
      'Fabricante',
      'Volume',
      'Media Consumo Mensal',
      'Estoque Atual (Caixas)',
      'Quantidade a Pedir (Caixas)',
    ];

    const rows = list.map((item) => [
      item.code || '-',
      item.name,
      item.clone,
      item.manufacturer,
      item.volume || '-',
      `${String(item.monthlyConsumption).replace('.', ',')} ${item.unit === 'TESTS' ? 'testes' : 'ml'}`,
      String(item.currentStock).replace('.', ','),
      String(item.suggestedOrderQty).replace('.', ','),
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.map((c) => `"${c}"`).join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = brandName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `pedido_${safeName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderOrderTable = (title: string, brandKey: string, list: ReagentItem[]) => (
    <SectionBlock>
      <SectionHeader>
        <SectionTitle>
          {title} ({list.length})
        </SectionTitle>
        <ExcelButton
          type="button"
          disabled={list.length === 0}
          onClick={() => exportToExcel(brandKey, list)}
        >
          📥 Gerar Excel ({title})
        </ExcelButton>
      </SectionHeader>

      <TableCard>
        <Table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Reagente</th>
              <th>Clone</th>
              <th>Volume</th>
              <th>Média Consumo Mensal</th>
              <th>Estoque Atual (Caixas)</th>
              <th>Caixas a Pedir</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '1.75rem', color: '#64748b' }}>
                  Nenhum reagente pendente de pedido para este fabricante.
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={item.id}>
                  <td>
                    <CodeCell>{item.code || '—'}</CodeCell>
                  </td>
                  <td>
                    <StrongText>{item.name}</StrongText>
                  </td>
                  <td>{item.clone}</td>
                  <td>{item.volume || '—'}</td>
                  <td>
                    {item.monthlyConsumption} {item.unit === 'TESTS' ? 'testes' : 'ml'}
                  </td>
                  <td>{item.currentStock}</td>
                  <td>
                    <OrderQtyBadge>{item.suggestedOrderQty} cx</OrderQtyBadge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableCard>
    </SectionBlock>
  );

  return (
    <PageWrapper>
      <TopBar>
        <BackButton type="button" onClick={onBack}>
          ← Menu Principal
        </BackButton>
        <StockLink type="button" onClick={onNavigateToStock}>
          🧪 Ver Estoque →
        </StockLink>
      </TopBar>

      <HeaderRow>
        <PageTitle>Pedidos de Reagentes</PageTitle>
        {itemsToOrder.length > 0 && (
          <ExcelButton
            type="button"
            onClick={() => exportToExcel('geral_ihq', itemsToOrder)}
          >
            📥 Gerar Excel Completo (Todos)
          </ExcelButton>
        )}
      </HeaderRow>

      {renderOrderTable('Pedido Agilent / Dako', 'agilent_dako', dakoOrders)}
      {renderOrderTable('Pedido Roche', 'roche', rocheOrders)}
    </PageWrapper>
  );
};

/* ---------------- Styled Components ---------------- */

const PageWrapper = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #334155;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
`;

const StockLink = styled.button`
  background: #e0f2fe;
  color: #0369a1;
  border: none;
  padding: 0.5rem 0.95rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const SectionBlock = styled.section`
  margin-bottom: 2.25rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
`;

const ExcelButton = styled.button`
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #047857;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    background: #f8fafc;
    color: #475569;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.92rem;
    color: #1e293b;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const CodeCell = styled.span`
  font-family: monospace;
  font-weight: 700;
  color: #0369a1;
  background: #f0f9ff;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
`;

const StrongText = styled.span`
  font-weight: 700;
  color: #0f172a;
`;

const OrderQtyBadge = styled.span`
  display: inline-block;
  font-weight: 800;
  color: #b45309;
  background: #fef3c7;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
`;
