import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { CreateReagentPayload, UnitMeasure } from '../../types/ihq.types';

interface ReagentFormProps {
  onBack: () => void;
  onCreateReagent: (payload: CreateReagentPayload) => Promise<void>;
  onNavigateToStock: () => void;
}

export const ReagentForm: React.FC<ReagentFormProps> = ({
  onBack,
  onCreateReagent,
  onNavigateToStock,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [clone, setClone] = useState('');
  const [code, setCode] = useState('');
  const [manufacturer, setManufacturer] = useState<'Dako / Agilent' | 'Roche'>('Dako / Agilent');
  const [volumeValue, setVolumeValue] = useState('');
  const [unit, setUnit] = useState<UnitMeasure>('ML');
  const [monthlyConsumption, setMonthlyConsumption] = useState('');
  const [currentStock, setCurrentStock] = useState('');

  const [errors, setErrors] = useState<{ name?: string; clone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const resetFormFields = () => {
    setName('');
    setClone('');
    setCode('');
    setManufacturer('Dako / Agilent');
    setVolumeValue('');
    setUnit('ML');
    setMonthlyConsumption('');
    setCurrentStock('');
    setErrors({});
    nameInputRef.current?.focus();
  };

  const validate = (): boolean => {
    const nextErrors: { name?: string; clone?: string } = {};
    if (!name.trim()) {
      nextErrors.name = 'O nome do reagente é obrigatório.';
    }
    if (!clone.trim()) {
      nextErrors.clone = 'O clone é obrigatório.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(null);
    setApiError(null);

    if (!validate()) return;

    const unitText = unit === 'ML' ? 'mL' : 'testes';
    const formattedVolume = volumeValue.trim() ? `${volumeValue.trim()} ${unitText}` : unitText;

    const payload: CreateReagentPayload = {
      name: name.trim(),
      clone: clone.trim(),
      code: code.trim(),
      manufacturer,
      volume: formattedVolume,
      unit,
      monthlyConsumption: parseFloat(monthlyConsumption) || 0,
      currentStock: parseFloat(currentStock) || 0,
    };

    try {
      setSubmitting(true);
      await onCreateReagent(payload);
      setSavedFeedback(`${payload.name} (${payload.clone})`);
      resetFormFields();
    } catch (err: any) {
      setApiError(
        err.message ||
          'Erro ao salvar no banco de dados. Verifique as permissões da tabela no Supabase.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <TopBar>
        <BackButton type="button" onClick={onBack}>
          ← Menu Principal
        </BackButton>
        <GoStockButton type="button" onClick={onNavigateToStock}>
          Ver Estoque →
        </GoStockButton>
      </TopBar>

      <FormCard onSubmit={handleSubmit} noValidate>
        <FormTitle>Cadastrar Reagente</FormTitle>

        {savedFeedback && (
          <SuccessBanner>
            <span>
              ✅ <strong>{savedFeedback}</strong> cadastrado com sucesso! O formulário foi limpo para o próximo item.
            </span>
            <BannerAction type="button" onClick={onNavigateToStock}>
              Ver no Estoque →
            </BannerAction>
          </SuccessBanner>
        )}

        {apiError && <ErrorBanner>⚠️ {apiError}</ErrorBanner>}

        <Grid2Cols>
          <FieldGroup>
            <Label htmlFor="name">Nome do Reagente *</Label>
            <Input
              ref={nameInputRef}
              id="name"
              placeholder="Ex: Ki-67, CK7, HER2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              $hasError={!!errors.name}
            />
            {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="clone">Clone *</Label>
            <Input
              id="clone"
              placeholder="Ex: MIB-1, SP52, 4B5"
              value={clone}
              onChange={(e) => setClone(e.target.value)}
              $hasError={!!errors.clone}
            />
            {errors.clone && <ErrorMsg>{errors.clone}</ErrorMsg>}
          </FieldGroup>
        </Grid2Cols>

        <Grid2Cols>
          <FieldGroup>
            <Label htmlFor="code">Código (exibido no pedido)</Label>
            <Input
              id="code"
              placeholder="Ex: IR626 ou 790-4462"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="manufacturer">Fabricante (Divisão na Planilha)</Label>
            <Select
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value as 'Dako / Agilent' | 'Roche')}
            >
              <option value="Dako / Agilent">Dako / Agilent</option>
              <option value="Roche">Roche</option>
            </Select>
          </FieldGroup>
        </Grid2Cols>

        <Grid3Cols>
          <FieldGroup>
            <Label htmlFor="volumeValue">Volume</Label>
            <VolumeRow>
              <Input
                id="volumeValue"
                placeholder="Ex: 6 ou 50"
                value={volumeValue}
                onChange={(e) => setVolumeValue(e.target.value)}
              />
              <UnitSelect
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitMeasure)}
              >
                <option value="ML">mL</option>
                <option value="TESTS">testes</option>
              </UnitSelect>
            </VolumeRow>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="monthlyConsumption">Consumo Mensal</Label>
            <Input
              id="monthlyConsumption"
              type="number"
              step="0.1"
              min="0"
              placeholder="Ex: 6"
              value={monthlyConsumption}
              onChange={(e) => setMonthlyConsumption(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="currentStock">Estoque Atual</Label>
            <Input
              id="currentStock"
              type="number"
              step="0.1"
              min="0"
              placeholder="Ex: 12"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
            />
          </FieldGroup>
        </Grid3Cols>

        <ButtonRow>
          <SecondaryButton type="button" onClick={onBack}>
            Cancelar
          </SecondaryButton>
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar Reagente'}
          </SubmitButton>
        </ButtonRow>
      </FormCard>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  max-width: 760px;
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

const GoStockButton = styled.button`
  background: #e0f2fe;
  border: none;
  color: #0369a1;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.5rem 0.95rem;
  border-radius: 8px;
  cursor: pointer;
`;

const FormCard = styled.form`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
`;

const FormTitle = styled.h1`
  font-size: 1.45rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
`;

const SuccessBanner = styled.div`
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 0.85rem 1.1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.92rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.85rem 1.1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const BannerAction = styled.button`
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  white-space: nowrap;
`;

const Grid2Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
`;

const Grid3Cols = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1.25rem;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.4rem;
`;

const VolumeRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ef4444' : '#cbd5e1')};
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  background: ${({ $hasError }) => ($hasError ? '#fef2f2' : '#ffffff')};

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const Select = styled.select`
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  background: #ffffff;
`;

const UnitSelect = styled.select`
  padding: 0.65rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  background: #f8fafc;
`;

const ErrorMsg = styled.span`
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 0.3rem;
  font-weight: 500;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const SecondaryButton = styled.button`
  padding: 0.7rem 1.25rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-weight: 600;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: #059669;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #047857;
  }
`;
