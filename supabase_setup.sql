-- ============================================================================
-- SCRIPT SQL DO LABORATÓRIO DE IMUNOISTOQUÍMICA (IHQ) - SUPABASE (PostgreSQL)
-- Como usar:
-- 1. No painel do Supabase, clique em "SQL Editor" no menu lateral esquerdo.
-- 2. Clique em "+ New query", cole todo este conteúdo e clique em "Run" (ou Ctrl+Enter).
-- ============================================================================

-- 1. COMANDO DDL (Data Definition Language): Cria a tabela de reagentes
CREATE TABLE IF NOT EXISTS public.reagents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,                              -- Nome do anticorpo/reagente (Obrigatório)
    clone TEXT NOT NULL,                             -- Clone (Obrigatório)
    code TEXT DEFAULT '',                            -- Código do catálogo (aparece no pedido)
    manufacturer TEXT DEFAULT 'Dako / Agilent',      -- 'Dako / Agilent' ou 'Roche'
    volume TEXT DEFAULT '',                          -- Ex: '6 mL', '50 testes'
    unit TEXT DEFAULT 'ML',                          -- 'ML' ou 'TESTS'
    monthly_consumption NUMERIC(10, 2) DEFAULT 0,    -- Média de consumo mensal
    current_stock NUMERIC(10, 2) DEFAULT 0,          -- Saldo atual de frascos/testes/mL
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SEGURANÇA (RLS - Row Level Security):
-- Permite que o seu sistema web (pelo computador e celular) leia, cadastre, atualize e exclua itens
ALTER TABLE public.reagents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total ao estoque IHQ" ON public.reagents;

CREATE POLICY "Acesso total ao estoque IHQ"
ON public.reagents
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- ============================================================================
-- GUIA RÁPIDO DE COMANDOS SQL PARA VOCÊ TREINAR NO SQL EDITOR DO SUPABASE:
-- (Os comandos abaixo estão comentados com '--' para não rodarem sozinhos.
--  Quando quiser testar um deles, basta selecionar as linhas sem '--' e clicar em Run!)
-- ============================================================================

-- A) LISTAR TODOS OS ANTICORPOS EM ORDEM ALFABÉTICA:
-- SELECT name, clone, code, manufacturer, current_stock, monthly_consumption
-- FROM public.reagents
-- ORDER BY name ASC;

-- B) FILTRAR APENAS OS REAGENTES DA ROCHE:
-- SELECT name, clone, code, current_stock
-- FROM public.reagents
-- WHERE manufacturer = 'Roche';

-- C) VER QUAIS ITENS PRECISAM DE PEDIDO (Fórmula dos 3 meses):
-- SELECT 
--   code AS codigo,
--   name AS reagente,
--   clone,
--   manufacturer AS fabricante,
--   current_stock AS estoque_atual,
--   (monthly_consumption * 3) - current_stock AS quantidade_a_pedir
-- FROM public.reagents
-- WHERE (monthly_consumption * 3) > current_stock;

-- D) INSERIR UM NOVO REAGENTE MANUALMENTE VIA SQL:
-- INSERT INTO public.reagents (name, clone, code, manufacturer, volume, unit, monthly_consumption, current_stock)
-- VALUES ('Ki-67', 'MIB-1', 'IR626', 'Dako / Agilent', '6 mL', 'ML', 6, 18);

-- E) ATUALIZAR O ESTOQUE DE UM ANTICORPO ESPECÍFICO VIA SQL:
-- UPDATE public.reagents
-- SET current_stock = 10
-- WHERE name = 'Ki-67' AND clone = 'MIB-1';

-- F) APAGAR UM REAGENTE PELO NOME:
-- DELETE FROM public.reagents
-- WHERE name = 'Ki-67' AND clone = 'MIB-1';
