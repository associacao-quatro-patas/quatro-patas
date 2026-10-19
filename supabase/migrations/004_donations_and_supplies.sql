-- =============================================================================
-- Quatro Patas · Migração 004 · Doações (Pix) e insumos necessários
-- =============================================================================
-- PROPOSTA: ainda NÃO aplicada. Revise antes de executar no SQL Editor.
--
-- O que esta migração faz:
--   1. Cria `donation_settings`: uma ÚNICA linha com os dados do Pix.
--   2. Cria `supplies`: a lista de insumos de que a instituição precisa.
--   3. Ativa RLS: qualquer visitante LÊ; só administradores (public.is_admin(),
--      migração 001) cadastram, editam ou excluem.
--
-- Segurança da execução:
--   * Não altera nem apaga nada existente (pets, admins, Storage e políticas).
--   * Reutiliza as funções public.is_admin() e public.set_updated_at() (001).
--   * Não insere dados: a chave Pix e os insumos são cadastrados pelo painel.
--   * Se algum objeto já existir, o script falha e nada é aplicado.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Dados do Pix (linha única)
-- -----------------------------------------------------------------------------
-- A chave primária `id` só aceita `true`, o que impede uma segunda linha.
--
-- Duas formas de oferecer o QR Code (o site usa a primeira disponível):
--   A) `pix_copy_paste`: o código "Pix Copia e Cola" OFICIAL, gerado pelo banco
--      da instituição para um QR Code estático. É exatamente o conteúdo do QR
--      Code impresso: o site desenha o QR a partir dele.
--   B) `pix_key` + `pix_merchant_name` + `pix_merchant_city`: com esses três
--      dados o site gera um QR Code estático no padrão do Banco Central (BR Code,
--      sem valor fixo).
-- Só a chave (sem nome/cidade) = o site mostra a chave e o botão de copiar,
-- mas sem QR Code. Tudo vazio = "doações via Pix disponíveis em breve".

create table public.donation_settings (
  id                boolean primary key default true,
  pix_key           text,
  pix_key_type      text,
  recipient_name    text,
  pix_merchant_name text,
  pix_merchant_city text,
  pix_copy_paste    text,
  notes             text,
  updated_at        timestamptz not null default now(),

  constraint donation_settings_single_row_check check (id),

  -- Chave e tipo andam juntos: ou os dois preenchidos, ou os dois vazios.
  constraint donation_settings_pix_key_pair_check
    check ((pix_key is null) = (pix_key_type is null)),

  -- cpf · cnpj · email · phone (celular) · random (chave aleatória)
  constraint donation_settings_pix_key_type_check
    check (pix_key_type is null or pix_key_type in ('cpf', 'cnpj', 'email', 'phone', 'random')),

  -- Formato de cada tipo de chave, como o Pix exige (o painel normaliza antes).
  constraint donation_settings_pix_key_format_check
    check (
      pix_key is null
      or (pix_key_type = 'cpf'    and pix_key ~ '^[0-9]{11}$')
      or (pix_key_type = 'cnpj'   and pix_key ~ '^[0-9]{14}$')
      or (pix_key_type = 'phone'  and pix_key ~ '^\+[1-9][0-9]{10,14}$')
      or (pix_key_type = 'email'  and pix_key ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(pix_key) <= 77)
      or (pix_key_type = 'random' and pix_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    ),

  constraint donation_settings_recipient_name_check
    check (recipient_name is null or char_length(btrim(recipient_name)) between 1 and 100),

  -- Limites do padrão BR Code do Banco Central: nome até 25, cidade até 15.
  constraint donation_settings_pix_merchant_name_check
    check (pix_merchant_name is null or char_length(btrim(pix_merchant_name)) between 1 and 25),

  constraint donation_settings_pix_merchant_city_check
    check (pix_merchant_city is null or char_length(btrim(pix_merchant_city)) between 1 and 15),

  -- Formato básico de um BR Code: começa com "000201", contém o identificador
  -- do Pix e termina com o código de verificação (CRC). O site também confere
  -- o CRC antes de exibir, e não mostra códigos inválidos.
  constraint donation_settings_pix_copy_paste_check
    check (
      pix_copy_paste is null
      or (
        char_length(pix_copy_paste) between 50 and 512
        and pix_copy_paste ~ '^000201'
        and pix_copy_paste ~* 'br\.gov\.bcb\.pix'
        and pix_copy_paste ~ '6304[0-9A-Fa-f]{4}$'
      )
    ),

  constraint donation_settings_notes_check
    check (notes is null or char_length(notes) <= 500)
);

comment on table public.donation_settings is
  'Dados de doação via Pix (linha única). Editada pelo painel administrativo.';
comment on column public.donation_settings.pix_key is
  'Chave Pix oficial, normalizada (CPF/CNPJ só dígitos; celular +55...; e-mail; aleatória em minúsculas).';
comment on column public.donation_settings.recipient_name is
  'Nome do recebedor exibido no site para conferência no app do banco.';
comment on column public.donation_settings.pix_merchant_name is
  'Nome do recebedor gravado no QR Code (até 25 caracteres, como no cadastro do banco).';
comment on column public.donation_settings.pix_merchant_city is
  'Cidade do recebedor gravada no QR Code (até 15 caracteres).';
comment on column public.donation_settings.pix_copy_paste is
  'Código "Pix Copia e Cola" oficial de um QR Code estático gerado pelo banco. Tem prioridade sobre os dados acima.';

create trigger donation_settings_set_updated_at
  before update on public.donation_settings
  for each row
  execute function public.set_updated_at();

alter table public.donation_settings enable row level security;

create policy "donation_settings: publico le"
  on public.donation_settings
  for select
  to anon, authenticated
  using (true);

create policy "donation_settings: admin cadastra"
  on public.donation_settings
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "donation_settings: admin edita"
  on public.donation_settings
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Sem política de DELETE: para "remover" a chave, o admin deixa o campo vazio.

revoke all on table public.donation_settings from anon, authenticated;
grant select on table public.donation_settings to anon;
grant select, insert, update on table public.donation_settings to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Insumos necessários
-- -----------------------------------------------------------------------------

create table public.supplies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  quantity    text,
  is_urgent   boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint supplies_name_check
    check (char_length(btrim(name)) between 1 and 80),

  constraint supplies_description_check
    check (description is null or char_length(description) <= 500),

  -- Texto livre, ex.: "10 kg", "20 unidades", "sempre bem-vindo".
  constraint supplies_quantity_check
    check (quantity is null or char_length(btrim(quantity)) between 1 and 60),

  constraint supplies_sort_order_check
    check (sort_order between 0 and 9999)
);

comment on table public.supplies is 'Insumos de que a instituição precisa.';
comment on column public.supplies.is_active is
  'false = oculto no site (ex.: necessidade já atendida), sem precisar excluir.';

create index supplies_active_order_idx
  on public.supplies (is_active, is_urgent desc, sort_order, name);

create trigger supplies_set_updated_at
  before update on public.supplies
  for each row
  execute function public.set_updated_at();

alter table public.supplies enable row level security;

-- Visitantes veem só os insumos ativos.
create policy "supplies: publico ve ativos"
  on public.supplies
  for select
  to anon, authenticated
  using (is_active);

-- Administradores veem todos, inclusive os ocultos.
create policy "supplies: admin ve todos"
  on public.supplies
  for select
  to authenticated
  using ((select public.is_admin()));

create policy "supplies: admin cadastra"
  on public.supplies
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "supplies: admin edita"
  on public.supplies
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "supplies: admin exclui"
  on public.supplies
  for delete
  to authenticated
  using ((select public.is_admin()));

revoke all on table public.supplies from anon, authenticated;
grant select on table public.supplies to anon;
grant select, insert, update, delete on table public.supplies to authenticated;

commit;
