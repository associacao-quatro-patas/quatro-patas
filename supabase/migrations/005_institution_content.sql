-- =============================================================================
-- Quatro Patas · Migração 005 · Conteúdo institucional (página "Sobre")
-- =============================================================================
-- PROPOSTA: ainda NÃO aplicada. Revise antes de executar no SQL Editor.
--
-- O que esta migração faz:
--   1. Cria `institution_content`: uma ÚNICA linha com os textos da página
--      pública "Sobre" e contatos opcionais, editável pelo painel.
--   2. Cria `institution_items_valid()`: validação das listas de "Valores" e
--      "Nosso trabalho" (cada item com nome e texto).
--   3. Ativa RLS: qualquer visitante LÊ; só administradores (public.is_admin(),
--      migração 001) cadastram e editam. Ninguém exclui a linha.
--
-- Regras de conteúdo:
--   * Todos os campos são opcionais. Campo vazio = NULL (texto só com espaços é
--     recusado), e o site continua usando o texto provisório de
--     src/content/sobre.ts para aquele trecho, marcado como pendente no painel.
--   * Não guarda o WhatsApp: ele continua na variável INSTITUTION_WHATSAPP.
--   * Não guarda quem editou: a tabela é pública para leitura, então só há a
--     data da última alteração (updated_at).
--
-- Segurança da execução:
--   * Não altera nem apaga nada existente (pets, admins, Storage, doações,
--     insumos e suas políticas).
--   * Reutiliza public.is_admin() e public.set_updated_at() (001) sem alterá-las.
--   * Não insere dados.
--   * Se algum objeto já existir, o script falha e nada é aplicado.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Validação das listas (Valores e Nosso trabalho)
-- -----------------------------------------------------------------------------
-- Formato esperado: [{"name": "Bem-estar animal", "text": "..."}, ...]
-- Cada item precisa ser um objeto com EXATAMENTE as chaves "name" e "text",
-- ambas texto não vazio e dentro do tamanho máximo.

create function public.institution_items_valid(
  items      jsonb,
  max_items  integer,
  max_name   integer,
  max_text   integer
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- CASE garante a ordem: as funções de array só rodam quando `items` é array
  -- (com AND o Postgres pode avaliar jsonb_array_length antes e gerar erro).
  select case
    when items is null or jsonb_typeof(items) <> 'array' then false
    when jsonb_array_length(items) not between 1 and max_items then false
    else not exists (
      select 1
      from jsonb_array_elements(items) as e(item)
      where case
        when jsonb_typeof(item) <> 'object' then true
        when jsonb_typeof(item -> 'name') is distinct from 'string' then true
        when jsonb_typeof(item -> 'text') is distinct from 'string' then true
        when (select count(*) from jsonb_object_keys(item)) <> 2 then true
        when char_length(btrim(item ->> 'name')) not between 1 and max_name then true
        when char_length(btrim(item ->> 'text')) not between 1 and max_text then true
        else false
      end
    )
  end;
$$;

comment on function public.institution_items_valid(jsonb, integer, integer, integer) is
  'Valida listas [{name, text}] da tabela institution_content (usada nas regras da tabela).';

-- -----------------------------------------------------------------------------
-- 2. Conteúdo institucional (linha única)
-- -----------------------------------------------------------------------------
-- A chave primária `id` só aceita `true`, o que impede uma segunda linha.

create table public.institution_content (
  id            boolean primary key default true,

  -- Textos da página "Sobre"
  intro_text    text,
  history_text  text,
  mission_text  text,
  vision_text   text,
  values_items  jsonb,
  work_intro    text,
  work_items    jsonb,

  -- Contatos opcionais (só aparecem no site se preenchidos)
  contact_email text,
  instagram_url text,
  phone         text,
  address       text,

  updated_at    timestamptz not null default now(),

  constraint institution_content_single_row_check check (id),

  constraint institution_content_intro_text_check
    check (intro_text is null or char_length(btrim(intro_text)) between 1 and 600),

  constraint institution_content_history_text_check
    check (history_text is null or char_length(btrim(history_text)) between 1 and 5000),

  constraint institution_content_mission_text_check
    check (mission_text is null or char_length(btrim(mission_text)) between 1 and 600),

  constraint institution_content_vision_text_check
    check (vision_text is null or char_length(btrim(vision_text)) between 1 and 600),

  -- Até 8 valores: nome até 60 e texto até 300 caracteres.
  constraint institution_content_values_items_check
    check (values_items is null or public.institution_items_valid(values_items, 8, 60, 300)),

  constraint institution_content_work_intro_check
    check (work_intro is null or char_length(btrim(work_intro)) between 1 and 300),

  -- Até 6 frentes de trabalho: nome até 60 e texto até 400 caracteres.
  constraint institution_content_work_items_check
    check (work_items is null or public.institution_items_valid(work_items, 6, 60, 400)),

  constraint institution_content_contact_email_check
    check (contact_email is null or (contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(contact_email) <= 120)),

  -- Só links do Instagram (evita links para outros sites no lugar do perfil).
  constraint institution_content_instagram_url_check
    check (
      instagram_url is null
      or (instagram_url ~ '^https://(www\.)?instagram\.com/[A-Za-z0-9._]+/?$' and char_length(instagram_url) <= 200)
    ),

  -- Dígitos, espaços, +, parênteses e hífen. Ex.: "+55 (11) 3333-4444".
  constraint institution_content_phone_check
    check (phone is null or (phone ~ '^[0-9 +()\-]+$' and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 8 and 15)),

  constraint institution_content_address_check
    check (address is null or char_length(btrim(address)) between 1 and 300)
);

comment on table public.institution_content is
  'Textos da página "Sobre" e contatos opcionais (linha única). Editada pelo painel. Campo NULL = site usa o texto provisório do código.';
comment on column public.institution_content.values_items is
  'Lista [{"name": ..., "text": ...}] dos valores da instituição (até 8).';
comment on column public.institution_content.work_items is
  'Lista [{"name": ..., "text": ...}] das frentes de trabalho (até 6).';

create trigger institution_content_set_updated_at
  before update on public.institution_content
  for each row
  execute function public.set_updated_at();

alter table public.institution_content enable row level security;

-- Visitantes leem: todo o conteúdo desta tabela é destinado à página pública.
create policy "institution_content: publico le"
  on public.institution_content
  for select
  to anon, authenticated
  using (true);

create policy "institution_content: admin cadastra"
  on public.institution_content
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "institution_content: admin edita"
  on public.institution_content
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Sem política de DELETE: para "apagar" um texto, o admin deixa o campo vazio
-- (o site volta a usar o texto provisório daquele trecho).

revoke all on table public.institution_content from anon, authenticated;
grant select on table public.institution_content to anon;
grant select, insert, update on table public.institution_content to authenticated;

commit;
