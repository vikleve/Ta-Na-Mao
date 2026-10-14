# Guia de Configuração e Publicação na Vercel — Tá na Mão

Este documento contém todas as instruções necessárias para publicar a versão atualizada do **Tá na Mão** na **Vercel** com banco de dados relacional **Supabase (PostgreSQL)** e segurança em nível de linha (RLS).

---

## 1. Justificativa da Escolha do Banco de Dados

Para este projeto, foi selecionado o **Supabase (PostgreSQL Gerenciado)** pelas seguintes razões técnicas:
1. **Compatibilidade Nativa com a Vercel**: Comunicação via HTTPS e PostgREST de alta performance, eliminando problemas de saturação de pool de conexões TCP característicos de funções serverless.
2. **Segurança no Servidor (RLS)**: O Supabase implementa **Row Level Security (RLS)** nativo diretamente no PostgreSQL. Isso garante que nenhum usuário consiga alterar ou ler orçamentos e mensagens que não pertençam a ele, independentemente do código no frontend.
3. **Autenticação Robusta**: Gestão completa de sessões, hash seguro de senhas e geração de tokens JWT seguros.
4. **Escalabilidade e Migrações**: Suporte a foreign keys, constraints relacionais, triggers para recálculo automático de notas e índices espaciais para geolocalização.

---

## 2. Passo a Passo de Configuração

### Passo 1: Criar o Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e faça login.
2. Clique em **"New Project"**.
3. Defina o nome do projeto (ex: `ta-na-mao-db`), defina uma senha forte para o banco de dados e selecione a região mais próxima (ex: `São Paulo (sa-east-1)`).
4. Aguarde a inicialização do projeto (cerca de 1 a 2 minutos).

### Passo 2: Executar as Migrações do Banco de Dados
1. No painel do seu projeto Supabase, acesse o menu **"SQL Editor"** na barra lateral esquerda.
2. Clique em **"New Query"**.
3. Abra o arquivo [`supabase_schema.sql`](./supabase_schema.sql) deste repositório, copie todo o seu conteúdo e cole no editor SQL do Supabase.
4. Clique no botão **"Run"** (ou pressione `Ctrl + Enter`).
5. Verifique se a mensagem `Success. No rows returned` é exibida. Todas as tabelas (`profiles`, `professions`, `professionals`, `quotes`, `reviews`, `chat_messages`), índices, triggers e políticas RLS foram criados.

### Passo 3: Obter as Credenciais da API
1. No painel do Supabase, clique em **Project Settings** (ícone de engrenagem) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xxxxxxxx.supabase.co`)
   - **Project API keys** > chave `anon` `public`

### Passo 4: Configurar as Variáveis na Vercel
1. Acesse o painel da sua conta na [Vercel](https://vercel.com).
2. Selecione o projeto **`ta-na-mao-vikleve`** (ou o projeto correspondente).
3. Vá em **Settings** > **Environment Variables**.
4. Cadastre as duas variáveis obrigatórias:

| Nome da Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `SUPABASE_URL` | URL do projeto Supabase | `https://xyzcompany.supabase.co` |
| `SUPABASE_ANON_KEY` | Chave pública anônima do Supabase | `eyJhbGciOiJIUzI1Ni...` |

5. Marque os ambientes **Production**, **Preview** e **Development**.
6. Clique em **Save**.

### Passo 5: Publicação / Redeploy
1. Faça o commit e push das alterações para a branch `main`:
   ```bash
   git add .
   git commit -m "feat: visual identity orange, responsive layout, custom professions, clean db"
   git push origin main
   ```
2. A Vercel iniciará automaticamente o build e deploy.
3. Acesse a URL do deployment gerado para validar em produção.

---

## 3. Verificação de Integridade em Produção

Após o deploy, verifique:
- O endpoint de saúde da Vercel: `https://seu-dominio.vercel.app/api/health`
- Deve retornar status `200 OK` com `databaseConfigured: true`.
- O site em `https://seu-dominio.vercel.app/` exibirá a nova identidade visual laranja `#FF7900`, responsividade completa e persistência de dados.
