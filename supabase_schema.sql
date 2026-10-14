-- ==============================================================================
-- TÁ NA MÃO - ESQUEMA COMPLETO DE BANCO DE DADOS (POSTGRESQL / SUPABASE)
-- ==============================================================================
-- Este script cria todas as tabelas, índices, triggers e políticas de segurança (RLS)
-- necessárias para suportar a plataforma Tá na Mão com persistência real na Vercel.
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE PERFIS DE USUÁRIO (Vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'pro')),
  phone TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PROFISSÕES E ESPECIALIDADES (Suporta pré-definidas e customizadas - RF04)
CREATE TABLE IF NOT EXISTS public.professions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_group TEXT NOT NULL DEFAULT 'outros',
  icon TEXT DEFAULT 'fa-briefcase',
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir profissões padrão iniciais (caso ainda não existam)
INSERT INTO public.professions (slug, name, category_group, icon, is_custom) VALUES
  ('eletricista', 'Eletricista', 'gerais', 'fa-bolt', false),
  ('encanador', 'Encanador', 'gerais', 'fa-faucet-drip', false),
  ('mecanico', 'Mecânico', 'automotivo', 'fa-wrench', false),
  ('informatica', 'Técnico de Informática', 'tecnologia', 'fa-laptop-code', false),
  ('celular', 'Técnico de Celular', 'tecnologia', 'fa-mobile-screen', false),
  ('diarista', 'Diarista', 'casa', 'fa-broom', false),
  ('pintor', 'Pintor', 'gerais', 'fa-paint-roller', false),
  ('pedreiro', 'Pedreiro', 'gerais', 'fa-trowel-bricks', false)
ON CONFLICT (slug) DO NOTHING;

-- 4. TABELA DE PROFISSIONAIS
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  profession_name TEXT NOT NULL,
  starting_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  bio TEXT,
  phone TEXT,
  address TEXT DEFAULT 'Sua Região',
  lat DOUBLE PRECISION NOT NULL DEFAULT -7.5083,
  lng DOUBLE PRECISION NOT NULL DEFAULT -35.3181,
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  reviews_count INT NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT true,
  available_today BOOLEAN NOT NULL DEFAULT true,
  experience_years INT NOT NULL DEFAULT 1,
  completed_jobs INT NOT NULL DEFAULT 0,
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE SOLICITAÇÕES DE ORÇAMENTO
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  pro_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  pro_name TEXT NOT NULL,
  category TEXT NOT NULL,
  service_title TEXT NOT NULL,
  details TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'Hoje',
  status TEXT NOT NULL DEFAULT 'Aguardando Resposta',
  status_color TEXT NOT NULL DEFAULT '#3b82f6',
  estimated_price TEXT,
  photo_url TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE AVALIAÇÕES DE CLIENTES
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  comment TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE MENSAGENS DO CHAT
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pro_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'pro')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ÍNDICES DE PERFORMANCE E BUSCA
CREATE INDEX IF NOT EXISTS idx_professionals_category ON public.professionals(category_slug);
CREATE INDEX IF NOT EXISTS idx_professionals_geo ON public.professionals(lat, lng);
CREATE INDEX IF NOT EXISTS idx_professions_slug ON public.professions(slug);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON public.quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_pro ON public.quotes(pro_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pro ON public.reviews(pro_id);
CREATE INDEX IF NOT EXISTS idx_chat_dialogue ON public.chat_messages(pro_id, client_id, created_at);

-- 9. TRIGGER PARA RECALCULAR AVALIAÇÕES AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.recalculate_pro_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.professionals
  SET 
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE pro_id = NEW.pro_id), 5.00),
    reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE pro_id = NEW.pro_id),
    updated_at = NOW()
  WHERE id = NEW.pro_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculate_pro_rating ON public.reviews;
CREATE TRIGGER trg_recalculate_pro_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_pro_rating();

-- 10. SEGURANÇA EM NÍVEL DE LINHA (ROW LEVEL SECURITY - RLS)

-- Habilitar RLS em todas as tabelas públicas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
DROP POLICY IF EXISTS "Perfis visíveis para autenticados" ON public.profiles;
CREATE POLICY "Perfis visíveis para autenticados" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuário pode criar seu perfil" ON public.profiles;
CREATE POLICY "Usuário pode criar seu perfil" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário pode atualizar seu perfil" ON public.profiles;
CREATE POLICY "Usuário pode atualizar seu perfil" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para PROFESSIONS
DROP POLICY IF EXISTS "Profissões visíveis para todos" ON public.professions;
CREATE POLICY "Profissões visíveis para todos" ON public.professions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuários autenticados podem cadastrar profissões" ON public.professions;
CREATE POLICY "Usuários autenticados podem cadastrar profissões" ON public.professions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para PROFESSIONALS
DROP POLICY IF EXISTS "Profissionais visíveis para o público" ON public.professionals;
CREATE POLICY "Profissionais visíveis para o público" ON public.professionals
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profissional pode cadastrar seu perfil" ON public.professionals;
CREATE POLICY "Profissional pode cadastrar seu perfil" ON public.professionals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profissional pode atualizar seu perfil" ON public.professionals;
CREATE POLICY "Profissional pode atualizar seu perfil" ON public.professionals
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para QUOTES
DROP POLICY IF EXISTS "Orçamentos visíveis para o cliente e para o profissional" ON public.quotes;
CREATE POLICY "Orçamentos visíveis para o cliente e para o profissional" ON public.quotes
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = pro_id)
  );

DROP POLICY IF EXISTS "Clientes autenticados podem criar orçamentos" ON public.quotes;
CREATE POLICY "Clientes autenticados podem criar orçamentos" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Políticas para REVIEWS
DROP POLICY IF EXISTS "Avaliações visíveis para o público" ON public.reviews;
CREATE POLICY "Avaliações visíveis para o público" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clientes autenticados podem enviar avaliações" ON public.reviews;
CREATE POLICY "Clientes autenticados podem enviar avaliações" ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para CHAT_MESSAGES
DROP POLICY IF EXISTS "Mensagens visíveis apenas para os participantes" ON public.chat_messages;
CREATE POLICY "Mensagens visíveis apenas para os participantes" ON public.chat_messages
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = pro_id)
  );

DROP POLICY IF EXISTS "Participantes podem enviar mensagens" ON public.chat_messages;
CREATE POLICY "Participantes podem enviar mensagens" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      auth.uid() = client_id OR 
      auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = pro_id)
    )
  );
