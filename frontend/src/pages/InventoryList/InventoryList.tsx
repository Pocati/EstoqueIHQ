import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ReagentItem, StockStatus } from '../../types/ihq.types';

interface InventoryListProps {
  reagents: ReagentItem[];
  onBack: () => void;
  onNavigateToRegister: () => void;
  onNavigateToOrders: () => void;
  onAdjustStock: (reagentId: string, delta: number) => Promise<void>;
  onDeleteReagent: (reagentId: string) => Promise<void>;
}

type DivisionTab = 'ALL' | 'DAKO' | 'ROCHE';

export const InventoryList: React.FC<InventoryListProps> = ({
  reagents,
  onBack,
  onNavigateToRegister,
  onNavigateToOrders,
  onAdjustStock,
  onDeleteReagent,
}) => {
  const [division, setDivision] = useState<DivisionTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const dakoItems = useMemo(
    () =>
      reagents.filter(
        (r) =>
          r.manufacturer.toLowerCase().includes('dako') ||
          r.manufacturer.toLowerCase().includes('agilent')
      ),
    [reagents]
  );

  const rocheItems = useMemo(
    () => reagents.filter((r) => r.manufacturer.toLowerCase().includes('roche')),
    [reagents]
  );

  const filterBySearch = (list: ReagentItem[]) => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.clone.toLowerCase().includes(q) ||
        (r.code || '').toLowerCase().includes(q)
    );
  };

  const renderSpreadsheet = (title: string, items: ReagentItem[], showManufacturerCol: boolean) => {
    const filtered = filterBySearch(items);

    return (
      <SectionBlock>
        <SectionTitle>
          {title} ({filtered.length})
        </SectionTitle>
        <TableCard>
          <Table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Reagente</th>
                <th>Clone</th>
                {showManufacturerCol && <th>Fabricante</th>}
                <th>Volume</th>
                <th>Média de Consumo Mensal</th>
                <th>Estoque Atual</th>
                <th style={{ textAlign: 'center' }}>Consumo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={showManufacturerCol ? 8 : 7}
                    style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}
                  >
                    Nenhum item nesta lista.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <StatusDot $status={item.status}>
                        {item.status === 'NORMAL' && '🟢'}
                        {item.status === 'WARNING' && '🟡'}
                        {item.status === 'CRITICAL' && '🔴'}
                      </StatusDot>
                    </td>
                    <td>
                      <StrongText>{item.name}</StrongText>
                    </td>
                    <td>{item.clone}</td>
                    {showManufacturerCol && <td>{item.manufacturer}</td>}
                    <td>{item.volume || '—'}</td>
                    <td>{item.monthlyConsumption}</td>
                    <td>
                      <StockValue>{item.currentStock}</StockValue>
                    </td>
                    <td>
                      <PlusMinusGroup>
                        <SymbolBtn
                          type="button"
                          $type="minus"
                          title="Diminuir 1"
                          onClick={() => onAdjustStock(item.id, -1)}
                        >
                          −
                        </SymbolBtn>
                        <SymbolBtn
                          type="button"
                          $type="plus"
                          title="Adicionar 1"
                          onClick={() => onAdjustStock(item.id, 1)}
                        >
                          +
                        </SymbolBtn>
                        <DeleteBtn
                          type="button"
                          title="Excluir reagente"
                          onClick={() => {
                            if (window.confirm(`Deseja excluir ${item.name} (${item.clone})?`)) {
                              onDeleteReagent(item.id);
                            }
                          }}
                        >
                          ×
                        </DeleteBtn>
                      </PlusMinusGroup>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </TableCard>
      </SectionBlock>
    );
  };

  return (
    <PageWrapper>
      <TopBar>
        <BackButton type="button" onClick={onBack}>
          ← Menu Principal
        </BackButton>
        <TopActions>
          <ActionLink type="button" $bg="#fef3c7" $color="#b45309" onClick={onNavigateToOrders}>
            📦 Ver Pedidos
          </ActionLink>
          <ActionLink type="button" $bg="#d1fae5" $color="#065f46" onClick={onNavigateToRegister}>
            ➕ Cadastrar Reagente
          </ActionLink>
        </TopActions>
      </TopBar>

      <HeaderRow>
        <PageTitle>Estoque de Reagentes IHQ</PageTitle>
        <SearchInput
          placeholder="Buscar reagente ou clone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </HeaderRow>

      <DivisionTabs>
        <TabButton
          type="button"
          $active={division === 'ALL'}
          onClick={() => setDivision('ALL')}
        >
          Planilha Geral ({reagents.length})
        </TabButton>
        <TabButton
          type="button"
          $active={division === 'DAKO'}
          onClick={() => setDivision('DAKO')}
        >
          Dako / Agilent ({dakoItems.length})
        </TabButton>
        <TabButton
          type="button"
          $active={division === 'ROCHE'}
          onClick={() => setDivision('ROCHE')}
        >
          Roche ({rocheItems.length})
        </TabButton>
      </DivisionTabs>

      {division === 'ALL' && (
        <>
          {renderSpreadsheet('Dako / Agilent', dakoItems, false)}
          {renderSpreadsheet('Roche', rocheItems, false)}
          {renderSpreadsheet('Planilha Geral — Todos os Anticorpos Cadastrados', reagents, true)}
        </>
      )}

      {division === 'DAKO' && renderSpreadsheet('Reagentes Dako / Agilent', dakoItems, false)}
      {division === 'ROCHE' && renderSpreadsheet('Reagentes Roche', rocheItems, false)}
    </PageWrapper>
  );
};

/* ---------------- Styled Components ---------------- */

const PageWrapper = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #334155;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
`;

const TopActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionLink = styled.button<{ $bg: string; $color: string }>`
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
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
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const SearchInput = styled.input`
  min-width: 260px;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  background: #ffffff;
`;

const DivisionTabs = styled.div`
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? '#0284c7' : '#cbd5e1')};
  background: ${({ $active }) => ($active ? '#0284c7' : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#334155')};
`;

const SectionBlock = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 0.65rem 0;
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
    vertical-align: middle;
    font-size: 0.92rem;
    color: #1e293b;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const StatusDot = styled.span<{ $status: StockStatus }>`
  font-size: 1.05rem;
`;

const StrongText = styled.span`
  font-weight: 700;
  color: #0f172a;
`;

const StockValue = styled.span`
  font-weight: 800;
  font-size: 0.98rem;
  color: #0f172a;
`;

const PlusMinusGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.45rem;
`;

const SymbolBtn = styled.button<{ $type: 'plus' | 'minus' }>`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${({ $type }) => ($type === 'minus' ? '#fecaca' : '#a7f3d0')};
  background: ${({ $type }) => ($type === 'minus' ? '#fef2f2' : '#ecfdf5')};
  color: ${({ $type }) => ($type === 'minus' ? '#dc2626' : '#059669')};
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    filter: brightness(0.95);
  }
`;

const DeleteBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-left: 0.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #dc2626;
    border-color: #fecaca;
    background: #fef2f2;
  }
`;
