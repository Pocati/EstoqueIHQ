import React from 'react';
import styled from 'styled-components';
import { ScreenRoute } from '../../types/ihq.types';

interface HomeProps {
  onNavigate: (route: ScreenRoute) => void;
  isCloudActive: boolean;
  summary: {
    totalReagents: number;
    criticalCount: number;
    warningCount: number;
    pendingOrdersCount: number;
  };
}

export const Home: React.FC<HomeProps> = ({ onNavigate, isCloudActive, summary }) => {
  return (
    <Container>
      <Header>
        <TopBadges>
          <BadgeIHQ>LABORATÓRIO DE IMUNOISTOQUÍMICA (IHQ)</BadgeIHQ>
          <CloudBadge $online={isCloudActive}>
            {isCloudActive ? '☁️ Supabase Conectado' : '💻 Modo Local (Configure .env p/ Supabase)'}
          </CloudBadge>
        </TopBadges>
        <Title>Controle de Estoque</Title>
      </Header>

      <MenuGrid>
        {/* 1. Ver Estoque */}
        <MenuCard onClick={() => onNavigate('STOCK')} $accentColor="#0284c7">
          <CardTop>
            <IconWrapper $bg="#e0f2fe" $color="#0284c7">
              🧪
            </IconWrapper>
            <AlertPills>
              {summary.criticalCount > 0 && (
                <Pill $variant="critical">🔴 {summary.criticalCount}</Pill>
              )}
              {summary.warningCount > 0 && (
                <Pill $variant="warning">🟡 {summary.warningCount}</Pill>
              )}
            </AlertPills>
          </CardTop>
          <CardTitle>Ver Estoque</CardTitle>
          <CardAction $color="#0284c7">
            Acessar ({summary.totalReagents} reagentes) →
          </CardAction>
        </MenuCard>

        {/* 2. Ver Pedidos */}
        <MenuCard onClick={() => onNavigate('ORDERS')} $accentColor="#d97706">
          <CardTop>
            <IconWrapper $bg="#fef3c7" $color="#d97706">
              📦
            </IconWrapper>
            {summary.pendingOrdersCount > 0 && (
              <Pill $variant="warning">{summary.pendingOrdersCount} p/ pedir</Pill>
            )}
          </CardTop>
          <CardTitle>Ver Pedidos</CardTitle>
          <CardAction $color="#d97706">Planilha & Exportar Excel →</CardAction>
        </MenuCard>

        {/* 3. Cadastrar Reagentes */}
        <MenuCard onClick={() => onNavigate('REGISTER')} $accentColor="#059669">
          <CardTop>
            <IconWrapper $bg="#d1fae5" $color="#059669">
              ➕
            </IconWrapper>
          </CardTop>
          <CardTitle>Cadastrar Reagentes</CardTitle>
          <CardAction $color="#059669">Novo Cadastro →</CardAction>
        </MenuCard>
      </MenuGrid>
    </Container>
  );
};

const Container = styled.main`
  max-width: 1020px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const TopBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 0.65rem;
`;

const BadgeIHQ = styled.span`
  display: inline-block;
  background: #0f172a;
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
`;

const CloudBadge = styled.span<{ $online: boolean }>`
  display: inline-block;
  background: ${({ $online }) => ($online ? '#d1fae5' : '#f1f5f9')};
  color: ${({ $online }) => ($online ? '#065f46' : '#475569')};
  border: 1px solid ${({ $online }) => ($online ? '#6ee7b7' : '#cbd5e1')};
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.32rem 0.75rem;
  border-radius: 999px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const MenuCard = styled.button<{ $accentColor: string }>`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-top: 5px solid ${({ $accentColor }) => $accentColor};
  border-radius: 14px;
  padding: 1.75rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  box-shadow: 0 4px 10px -2px rgba(15, 23, 42, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 24px -4px rgba(15, 23, 42, 0.12);
    border-color: ${({ $accentColor }) => $accentColor};
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 1.25rem;
  gap: 0.5rem;
`;

const IconWrapper = styled.div<{ $bg: string; $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const AlertPills = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const Pill = styled.span<{ $variant: 'critical' | 'warning' }>`
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: ${({ $variant }) => ($variant === 'critical' ? '#fee2e2' : '#fef3c7')};
  color: ${({ $variant }) => ($variant === 'critical' ? '#b91c1c' : '#b45309')};
`;

const CardTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
`;

const CardAction = styled.span<{ $color: string }>`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ $color }) => $color};
`;
