-- =====================================================================
-- Taber 25 anos — "Eu faço parte dessa história"
-- Estrutura do banco (Supabase / Postgres)
-- Rode no SQL Editor do Supabase, uma única vez.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tipos ----------
do $$ begin
  create type categoria_relato as enum ('gratidao', 'milagre', 'transformacao');
exception when duplicate_object then null; end $$;

do $$ begin
  create type status_relato as enum ('pendente', 'aprovado', 'rejeitado', 'arquivado');
exception when duplicate_object then null; end $$;

-- ---------- Relatos ----------
create table if not exists public.relatos (
  id                     uuid primary key default gen_random_uuid(),
  categoria              categoria_relato not null,
  nome                   text check (nome is null or char_length(nome) <= 80),
  relato                 text not null check (char_length(relato) between 10 and 2000),
  relato_original        text not null,          -- texto exatamente como foi enviado (nunca é editado)
  anonimo                boolean not null default false,
  autorizacao_publicacao boolean not null default false,
  status                 status_relato not null default 'pendente',

  -- imagem opcional
  imagem_path            text,                   -- caminho no bucket privado "relatos"
  imagem_largura         integer,
  imagem_altura          integer,
  exibir_imagem          boolean not null default true,  -- a equipe pode ocultar a imagem sem apagar

  -- projeção
  ativo_projecao         boolean not null default true,  -- liga/desliga um relato aprovado no telão
  ordem_exibicao         integer,                        -- opcional: menor aparece primeiro no modo cronológico

  -- controle
  demo                   boolean not null default false, -- dados de demonstração
  editado                boolean not null default false,
  data_envio             timestamptz not null default now(),
  data_aprovacao         timestamptz,
  data_publicacao        timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists relatos_status_idx     on public.relatos (status);
create index if not exists relatos_categoria_idx  on public.relatos (categoria);
create index if not exists relatos_envio_idx      on public.relatos (data_envio desc);
create index if not exists relatos_projecao_idx   on public.relatos (status, ativo_projecao, autorizacao_publicacao);

create or replace function public.tocar_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists relatos_updated_at on public.relatos;
create trigger relatos_updated_at before update on public.relatos
  for each row execute function public.tocar_updated_at();

-- ---------- Configuração da projeção (linha única) ----------
create table if not exists public.configuracoes (
  id                 smallint primary key default 1 check (id = 1),
  projecao_ativa     boolean not null default true,
  tempo_exibicao     integer not null default 14 check (tempo_exibicao between 5 and 120),   -- segundos por tela
  ajuste_leitura     boolean not null default true,   -- soma tempo extra para textos longos
  tempo_transicao    integer not null default 1200 check (tempo_transicao between 200 and 5000), -- ms
  modo_ordem         text not null default 'categorias'
                     check (modo_ordem in ('categorias', 'aleatorio', 'cronologico')),
  categorias_ativas  categoria_relato[] not null default array['gratidao','milagre','transformacao']::categoria_relato[],
  mostrar_imagens    boolean not null default true,
  mostrar_nomes      boolean not null default true,
  mostrar_qrcode     boolean not null default true,
  updated_at         timestamptz not null default now()
);

insert into public.configuracoes (id) values (1) on conflict (id) do nothing;

drop trigger if exists configuracoes_updated_at on public.configuracoes;
create trigger configuracoes_updated_at before update on public.configuracoes
  for each row execute function public.tocar_updated_at();

-- ---------- Administradores (lista de e-mails autorizados) ----------
create table if not exists public.admins (
  email      text primary key check (email = lower(email)),
  nome       text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Segurança (RLS) ----------
-- O público NUNCA acessa as tabelas diretamente.
-- Envios e a tela /tv passam por rotas do servidor, que validam e filtram tudo.
alter table public.relatos       enable row level security;
alter table public.configuracoes enable row level security;
alter table public.admins        enable row level security;

drop policy if exists "admins leem relatos"      on public.relatos;
drop policy if exists "admins alteram relatos"   on public.relatos;
drop policy if exists "admins leem config"       on public.configuracoes;
drop policy if exists "admins alteram config"    on public.configuracoes;
drop policy if exists "admin ve a si mesmo"      on public.admins;

create policy "admins leem relatos"    on public.relatos       for select using (public.is_admin());
create policy "admins alteram relatos" on public.relatos       for all    using (public.is_admin()) with check (public.is_admin());
create policy "admins leem config"     on public.configuracoes for select using (public.is_admin());
create policy "admins alteram config"  on public.configuracoes for update using (public.is_admin()) with check (public.is_admin());
create policy "admin ve a si mesmo"    on public.admins        for select using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------- Armazenamento de imagens (bucket privado) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('relatos', 'relatos', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false;
-- Sem policies no bucket: só o servidor (service role) lê e grava.
-- A tela /tv recebe links assinados e temporários apenas de imagens aprovadas.
