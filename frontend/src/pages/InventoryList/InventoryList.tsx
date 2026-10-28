import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
  ML_BOX_OPTIONS,
  ReagentItem,
  StockStatus,
  TESTS_BOX_OPTIONS,
  UnitMeasure,
  UpdateReagentPayload,
} from '../../types/ihq.types';

interface InventoryListProps {
  reagents: ReagentItem[];
  onBack: () => void;
  onNavigateToRegister: () => void;
  onNavigateToOrders: () => void;
  onAdjustStock: (reagentId: string, delta: number) => Promise<void>;
  onUpdateReagent: (reagentId: string, payload: UpdateReagentPayload) => Promise<void>;
  onDeleteReagent: (reagentId: string) => Promise<void>;
}

type DivisionTab = 'ALL' | 'DAKO' | 'ROCHE';

export const InventoryList: React.FC<InventoryListProps> = ({
  reagents,
  onBack,
  onNavigateToRegister,
  onNavigateToOrders,
  onAdjustStock,
  onUpdateReagent,
  onDeleteReagent,
}) => {
  const [division, setDivision] = useState<DivisionTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Modal de Edição
  const [editingItem, setEditingItem] = useState<ReagentItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editClone, setEditClone] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editManufacturer, setEditManufacturer] = useState<'Dako / Agilent' | 'Roche'>(
    'Dako / Agilent'
  );
  const [editUnit, setEditUnit] = useState<UnitMeasure>('ML');
  const [editVolume, setEditVolume] = useState<string>(ML_BOX_OPTIONS[0]);
  const [editMonthlyConsumption, setEditMonthlyConsumption] = useState('');
  const [editCurrentStock, setEditCurrentStock] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleDecreaseStock = (item: ReagentItem) => {
    if (item.currentStock <= 0) return;
    const confirmed = window.confirm(
      `Confirmar o descarte / baixa de 1 caixa do reagente "${item.name}" (${item.clone})?`
    );
    if (confirmed) {
      onAdjustStock(item.id, -1);
    }
  };

  const openEditModal = (item: ReagentItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditClone(item.clone);
    setEditCode(item.code || '');
    setEditManufacturer(
      item.manufacturer.toLowerCase().includes('roche') ? 'Roche' : 'Dako / Agilent'
    );

    const detectedUnit: UnitMeasure =
      item.unit === 'TESTS' || item.volume === '50' || item.volume === '250' ? 'TESTS' : 'ML';
    setEditUnit(detectedUnit);

    const normalizedVol = item.volume
      .toLowerCase()
      .replace('testes', '')
      .trim();

    const validOptions: readonly string[] =
      detectedUnit === 'ML' ? ML_BOX_OPTIONS : TESTS_BOX_OPTIONS;
    setEditVolume(validOptions.includes(normalizedVol) ? normalizedVol : validOptions[0]);

    setEditMonthlyConsumption(String(item.monthlyConsumption ?? 0));
    setEditCurrentStock(String(item.currentStock ?? 0));
    setEditError(null);
  };

  const handleEditUnitChange = (newUnit: UnitMeasure) => {
    setEditUnit(newUnit);
    setEditVolume(newUnit === 'ML' ? ML_BOX_OPTIONS[0] : TESTS_BOX_OPTIONS[0]);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError(null);

    if (!editName.trim() || !editClone.trim()) {
      setEditError('Nome do reagente e Clone são obrigatórios.');
      return;
    }

    try {
      setSavingEdit(true);
      await onUpdateReagent(editingItem.id, {
        name: editName.trim(),
        clone: editClone.trim(),
        code: editCode.trim(),
        manufacturer: editManufacturer,
        volume: editVolume,
        unit: editUnit,
        monthlyConsumption: parseFloat(editMonthlyConsumption) || 0,
        currentStock: parseFloat(editCurrentStock) || 0,
      });
      setEditingItem(null);
    } catch (err: any) {
      setEditError(err.message || 'Erro ao atualizar reagente.');
    } finally {
      setSavingEdit(false);
    }
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
                <th>Estoque Atual (Caixas)</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
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
                    <td>
                      {item.monthlyConsumption} {item.unit === 'TESTS' ? 'testes' : 'ml'}
                    </td>
                    <td>
                      <StockValue>{item.currentStock}</StockValue>
                    </td>
                    <td>
                      <PlusMinusGroup>
                        <SymbolBtn
                          type="button"
                          $type="minus"
                          title="Dar baixa / descartar 1 caixa"
                          onClick={() => handleDecreaseStock(item)}
                        >
                          −
                        </SymbolBtn>
                        <SymbolBtn
                          type="button"
                          $type="plus"
                          title="Adicionar 1 caixa"
                          onClick={() => onAdjustStock(item.id, 1)}
                        >
                          +
                        </SymbolBtn>
                        <EditBtn
                          type="button"
                          title="Editar informações do reagente"
                          onClick={() => openEditModal(item)}
                        >
                          ✏️
                        </EditBtn>
                        <DeleteBtn
                          type="button"
                          title="Excluir reagente do cadastro"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Deseja excluir permanentemente o reagente "${item.name}" (${item.clone}) da lista?`
                              )
                            ) {
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

  const editBoxOptions = editUnit === 'ML' ? ML_BOX_OPTIONS : TESTS_BOX_OPTIONS;

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

      {/* Modal de Edição Completa */}
      {editingItem && (
        <ModalOverlay onClick={() => setEditingItem(null)}>
          <ModalForm onClick={(e) => e.stopPropagation()} onSubmit={handleSaveEdit}>
            <ModalTitle>Editar Reagente</ModalTitle>

            {editError && <ModalError>{editError}</ModalError>}

            <ModalGrid>
              <ModalField>
                <label>Nome do Reagente *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </ModalField>

              <ModalField>
                <label>Clone *</label>
                <input
                  type="text"
                  value={editClone}
                  onChange={(e) => setEditClone(e.target.value)}
                  required
                />
              </ModalField>
            </ModalGrid>

            <ModalGrid>
              <ModalField>
                <label>Código (Pedido)</label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                />
              </ModalField>

              <ModalField>
                <label>Fabricante</label>
                <select
                  value={editManufacturer}
                  onChange={(e) =>
                    setEditManufacturer(e.target.value as 'Dako / Agilent' | 'Roche')
                  }
                >
                  <option value="Dako / Agilent">Dako / Agilent</option>
                  <option value="Roche">Roche</option>
                </select>
              </ModalField>
            </ModalGrid>

            <ModalGrid>
              <ModalField>
                <label>Tipo de Consumo</label>
                <select
                  value={editUnit}
                  onChange={(e) => handleEditUnitChange(e.target.value as UnitMeasure)}
                >
                  <option value="ML">mL</option>
                  <option value="TESTS">Testes</option>
                </select>
              </ModalField>

              <ModalField>
                <label>Volume</label>
                <select
                  value={editVolume}
                  onChange={(e) => setEditVolume(e.target.value)}
                >
                  {editBoxOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </ModalField>
            </ModalGrid>

            <ModalGrid>
              <ModalField>
                <label>Consumo Mensal ({editUnit === 'ML' ? 'em ml' : 'em testes'})</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={editMonthlyConsumption}
                  onChange={(e) => setEditMonthlyConsumption(e.target.value)}
                />
              </ModalField>

              <ModalField>
                <label>Quantidade no Estoque (Caixas)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={editCurrentStock}
                  onChange={(e) => setEditCurrentStock(e.target.value)}
                />
              </ModalField>
            </ModalGrid>

            <ModalActions>
              <CancelBtn type="button" onClick={() => setEditingItem(null)}>
                Cancelar
              </CancelBtn>
              <SaveBtn type="submit" disabled={savingEdit}>
                {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </SaveBtn>
            </ModalActions>
          </ModalForm>
        </ModalOverlay>
      )}
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
  gap: 0.4rem;
`;

const SymbolBtn = styled.button<{ $type: 'plus' | 'minus' }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${({ $type }) => ($type === 'minus' ? '#fecaca' : '#a7f3d0')};
  background: ${({ $type }) => ($type === 'minus' ? '#fef2f2' : '#ecfdf5')};
  color: ${({ $type }) => ($type === 'minus' ? '#dc2626' : '#059669')};
  font-size: 1.15rem;
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

const EditBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #bae6fd;
  background: #f0f9ff;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e0f2fe;
  }
`;

const DeleteBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #dc2626;
    border-color: #fecaca;
    background: #fef2f2;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
`;

const ModalForm = styled.form`
  background: #ffffff;
  border-radius: 14px;
  max-width: 580px;
  width: 100%;
  padding: 1.75rem;
  box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.25);
`;

const ModalTitle = styled.h3`
  margin: 0 0 1.25rem 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
`;

const ModalError = styled.div`
  background: #fef2f2;
  color: #b91c1c;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ModalField = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.35rem;
  }

  input,
  select {
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 0.92rem;
    color: #0f172a;
    background: #ffffff;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const CancelBtn = styled.button`
  padding: 0.65rem 1.15rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-weight: 600;
  cursor: pointer;
`;

const SaveBtn = styled.button`
  padding: 0.65rem 1.35rem;
  border-radius: 8px;
  border: none;
  background: #0284c7;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #0369a1;
  }
`;
