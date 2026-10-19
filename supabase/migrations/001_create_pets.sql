-- =============================================================================
-- Quatro Patas · Migração 001 · Administradores autorizados e tabela de pets
-- =============================================================================
-- O que esta migração faz:
--   1. Cria a tabela `admins`, a lista de usuários autorizados a administrar.
--   2. Cria a função `is_admin()`, usada pelas políticas de segurança.
--   3. Cria a tabela `pets`, com validações e `updated_at` automático.
--   4. Ativa o RLS e define quem pode ler e quem pode alterar cada tabela.
--
-- Segurança da execução:
--   * Não apaga nem altera nada que já exista. Se algum objeto já existir,
--     o script falha e a transação inteira é desfeita, sem aplicar nada.
--   * Não insere dados.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Administradores autorizados
-- -----------------------------------------------------------------------------
-- Estar logado NÃO basta para administrar: o usuário precisa constar nesta
-- tabela. Ela só é alterada pelo SQL Editor do Supabase (como dono do banco),
-- e nunca pelo site, porque não há políticas de INSERT, UPDATE nem DELETE.

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Usuários autorizados a usar o painel. Gerenciada apenas pelo SQL Editor.';

alter table public.admins enable row level security;

-- Cada usuário logado pode consultar apenas a própria linha, para que o painel
-- consiga saber se quem está logado é administrador.
create policy "admins: usuario ve apenas o proprio registro"
  on public.admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on table public.admins from anon, authenticated;
grant select on table public.admins to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Função de verificação de administrador
-- -----------------------------------------------------------------------------
-- SECURITY DEFINER permite consultar `admins` sem depender das políticas da
-- tabela. O search_path vazio evita sequestro de nomes; por isso todos os
-- objetos são citados com o schema completo.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
  );
$$;

comment on function public.is_admin() is
  'Retorna true se o usuário autenticado atual está na tabela admins.';

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 3. Atualização automática de updated_at
-- -----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. Tabela de pets
-- -----------------------------------------------------------------------------

create table public.pets (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  species       text not null,
  sex           text not null,
  age           text,
  size          text not null,
  description   text,
  story         text,
  is_neutered   boolean not null default false,
  is_vaccinated boolean not null default false,
  status        text not null default 'available',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint pets_slug_key unique (slug),

  constraint pets_name_check
    check (char_length(btrim(name)) between 1 and 80),

  -- Apenas letras minúsculas, números e hífens simples: "rex", "mel-2".
  constraint pets_slug_format_check
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),

  constraint pets_species_check
    check (species in ('dog', 'cat', 'other')),

  constraint pets_sex_check
    check (sex in ('male', 'female', 'unknown')),

  -- Texto livre, como "2 anos" ou "filhote", pois nem sempre se sabe a idade exata.
  constraint pets_age_check
    check (age is null or char_length(btrim(age)) between 1 and 50),

  constraint pets_size_check
    check (size in ('small', 'medium', 'large')),

  constraint pets_description_check
    check (description is null or char_length(description) <= 2000),

  constraint pets_story_check
    check (story is null or char_length(story) <= 5000),

  -- available = disponível · adoption_in_progress = em processo · adopted = adotado
  constraint pets_status_check
    check (status in ('available', 'adoption_in_progress', 'adopted')),

  constraint pets_updated_after_created_check
    check (updated_at >= created_at)
);

comment on table public.pets is 'Animais da Quatro Patas.';
comment on column public.pets.status is
  'available = disponível; adoption_in_progress = em processo de adoção; adopted = adotado.';

-- Listagem pública: filtra por status e ordena pelos mais recentes.
create index pets_status_created_at_idx
  on public.pets (status, created_at desc);

create trigger pets_set_updated_at
  before update on public.pets
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5. RLS e políticas dos pets
-- -----------------------------------------------------------------------------

alter table public.pets enable row level security;

-- Visitantes (e qualquer usuário logado) veem somente os animais exibíveis:
-- disponíveis ou em processo de adoção. Os adotados ficam ocultos.
create policy "pets: publico ve animais exibiveis"
  on public.pets
  for select
  to anon, authenticated
  using (status in ('available', 'adoption_in_progress'));

-- Administradores autorizados veem todos, inclusive os adotados.
create policy "pets: admin ve todos"
  on public.pets
  for select
  to authenticated
  using ((select public.is_admin()));

create policy "pets: admin cadastra"
  on public.pets
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "pets: admin edita"
  on public.pets
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "pets: admin exclui"
  on public.pets
  for delete
  to authenticated
  using ((select public.is_admin()));

-- Permissões de tabela (camada extra além do RLS): visitantes só podem ler.
revoke all on table public.pets from anon, authenticated;
grant select on table public.pets to anon;
grant select, insert, update, delete on table public.pets to authenticated;

commit;
