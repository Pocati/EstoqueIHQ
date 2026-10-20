# Controle de Estoque IHQ (Supabase + React + TypeScript)

Sistema web responsivo para controle de estoque de **Imunoistoquímica (IHQ)** com sincronização em nuvem via **Supabase (PostgreSQL)** para acesso simultâneo pelo **celular e computador**.

---

## Passo a Passo Rápido: Colocar o Banco no Supabase Hoje (5 minutos)

### 1. Criar o projeto gratuito no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e entre com sua conta do **GitHub**.
2. Clique em **New Project**, escolha um nome (ex: `estoque-ihq`), defina uma senha para o banco e selecione a região **South America (São Paulo)**.
3. Aguarde ~1 minuto até o banco ficar pronto.

### 2. Rodar o seu primeiro comando SQL (Criar a Tabela)
1. No menu lateral esquerdo do Supabase, clique em **SQL Editor** e depois em **+ New query**.
2. Abra o arquivo [`supabase_setup.sql`](./supabase_setup.sql) deste projeto, copie todo o conteúdo dele e cole no editor do Supabase.
3. Clique no botão verde **Run** (canto inferior direito).
   * Pronto! A tabela `reagents` foi criada no PostgreSQL e no final do arquivo há exemplos de comandos `SELECT`, `INSERT`, `UPDATE` e `DELETE` para você praticar SQL quando quiser.

### 3. Copiar a URL e a Chave para o seu projeto
1. No menu lateral do Supabase, clique em **Project Settings (ícone de engrenagem)** → **API**.
2. Copie a **Project URL** e a chave **anon / public** (em *Project API keys*).
3. Abra o arquivo [`frontend/.env`](./frontend/.env) e cole os dois valores:
   ```env
   VITE_SUPABASE_URL="https://seu-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

### 4. Rodar no seu Computador
```powershell
cd frontend
npm install
npm run dev
```
Abra `http://localhost:5173`. No topo da tela inicial aparecerá o selo verde **☁️ Supabase Conectado**.

---

## Como acessar pelo Celular (Publicar grátis na Vercel)

1. Suba esta pasta para um repositório no seu **GitHub**.
2. Entre em [https://vercel.com](https://vercel.com) com sua conta do GitHub e clique em **Add New → Project**.
3. Importe o repositório do projeto:
   * Em **Root Directory**, selecione `frontend`.
   * Em **Environment Variables**, adicione as mesmas duas variáveis (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
4. Clique em **Deploy**. Em 1 minuto a Vercel vai gerar um link (ex: `https://estoque-ihq.vercel.app`) que você pode abrir no navegador do **celular** e do **computador**, salvando tudo no mesmo banco de dados do Supabase em tempo real!
