import React, { useEffect, useState, useCallback } from 'react';
import { GlobalStyles } from './styles/GlobalStyles';
import { Home } from './pages/Home/Home';
import { ReagentForm } from './pages/ReagentForm/ReagentForm';
import { InventoryList } from './pages/InventoryList/InventoryList';
import { OrdersPanel } from './pages/OrdersPanel/OrdersPanel';
import {
  CreateReagentPayload,
  ReagentItem,
  ScreenRoute,
  UpdateReagentPayload,
} from './types/ihq.types';
import { ihqApi } from './services/api';

export const App: React.FC = () => {
  const [route, setRoute] = useState<ScreenRoute>('HOME');
  const [reagents, setReagents] = useState<ReagentItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await ihqApi.listReagents();
      setReagents(data);
    } catch (err) {
      console.error('Erro ao carregar reagentes:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateReagent = async (payload: CreateReagentPayload) => {
    await ihqApi.createReagent(payload);
    await loadData();
  };

  const handleUpdateReagent = async (reagentId: string, payload: UpdateReagentPayload) => {
    await ihqApi.updateReagent(reagentId, payload);
    await loadData();
  };

  const handleAdjustStock = async (reagentId: string, delta: number) => {
    await ihqApi.adjustStock(reagentId, delta);
    await loadData();
  };

  const handleDeleteReagent = async (reagentId: string) => {
    await ihqApi.deleteReagent(reagentId);
    await loadData();
  };

  const summary = {
    totalReagents: reagents.length,
    criticalCount: reagents.filter((r) => r.status === 'CRITICAL').length,
    warningCount: reagents.filter((r) => r.status === 'WARNING').length,
    pendingOrdersCount: reagents.filter((r) => r.suggestedOrderQty > 0).length,
  };

  return (
    <>
      <GlobalStyles />
      {route === 'HOME' && (
        <Home
          onNavigate={setRoute}
          isCloudActive={ihqApi.isCloudActive()}
          summary={summary}
        />
      )}

      {route === 'REGISTER' && (
        <ReagentForm
          onBack={() => setRoute('HOME')}
          onCreateReagent={handleCreateReagent}
          onNavigateToStock={() => setRoute('STOCK')}
        />
      )}

      {route === 'STOCK' && (
        <InventoryList
          reagents={reagents}
          onBack={() => setRoute('HOME')}
          onNavigateToRegister={() => setRoute('REGISTER')}
          onNavigateToOrders={() => setRoute('ORDERS')}
          onAdjustStock={handleAdjustStock}
          onUpdateReagent={handleUpdateReagent}
          onDeleteReagent={handleDeleteReagent}
        />
      )}

      {route === 'ORDERS' && (
        <OrdersPanel
          reagents={reagents}
          onBack={() => setRoute('HOME')}
          onNavigateToStock={() => setRoute('STOCK')}
        />
      )}
    </>
  );
};

export default App;
