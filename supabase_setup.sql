-- ============================================================================
-- SCRIPT SQL DO LABORATÓRIO DE IMUNOISTOQUÍMICA (IHQ) - SUPABASE (PostgreSQL)
-- ============================================================================

-- 1. Cria a tabela de reagentes
CREATE TABLE IF NOT EXISTS public.reagents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    clone TEXT NOT NULL,
    code TEXT DEFAULT '',
    manufacturer TEXT DEFAULT 'Dako / Agilent',
    volume TEXT DEFAULT '',
    unit TEXT DEFAULT 'ML',
    monthly_consumption NUMERIC(10, 2) DEFAULT 0,
    current_stock NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Concede permissões de leitura, inserção, edição e exclusão para a API do Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reagents TO anon, authenticated, service_role;

-- 3. Configura a política de segurança (RLS)
ALTER TABLE public.reagents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total ao estoque IHQ" ON public.reagents;

CREATE POLICY "Acesso total ao estoque IHQ"
ON public.reagents
FOR ALL
TO public
USING (true)
WITH CHECK (true);
