-- =============================================================================
-- Quatro Patas · Migração 006 · Fotos do site (editáveis pelo painel)
-- =============================================================================
-- PROPOSTA: ainda NÃO aplicada. Revise antes de executar no SQL Editor.
--
-- O que esta migração faz:
--   * Cria `site_photos`: qual foto aparece em cada espaço fixo do site
--     (banners da página inicial, "Quem somos", banner e foto de Doações).
--   * Os arquivos ficam no bucket "pets" (já existente). As políticas de
--     Storage da migração 002 já permitem que só administradores enviem,
--     troquem e apaguem imagens, e o bucket é público para leitura.
--   * RLS: qualquer visitante LÊ; só administradores (public.is_admin(),
--     migração 001) cadastram, trocam e removem fotos.
--
-- Segurança da execução:
--   * Não altera nem apaga nada existente (pets, admins, Storage, doações,
--     insumos, conteúdo institucional e suas políticas).
--   * Reutiliza public.is_admin() e public.set_updated_at() (001) sem alterá-las.
--   * Não insere dados: enquanto um espaço não tiver foto, o site mostra a
--     ilustração ou o espaço reservado atual.
--   * Se algum objeto já existir, o script falha e nada é aplicado.
-- =============================================================================

begin;

create table public.site_photos (
  -- Espaço do site onde a foto aparece (lista fechada).
  slot       text primary key,
  -- Arquivo no bucket "pets" (mesmo formato das fotos dos animais).
  photo_path text not null,
  -- Descrição da foto para leitores de tela.
  alt_text   text,
  updated_at timestamptz not null default now(),

  constraint site_photos_slot_check check (
    slot in (
      'home_hero_adocao',   -- Início: banner "Adote"
      'home_hero_doacao',   -- Início: banner "Sua doação faz a diferença"
      'home_hero_sobre',    -- Início: banner "Conheça a ONG"
      'home_quem_somos',    -- Início: foto de "Quem somos"
      'doacoes_hero',       -- Doações: banner do topo
      'doacoes_impacto'     -- Doações: foto de "Cada doação salva uma vida"
    )
  ),

  constraint site_photos_photo_path_check check (
    photo_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$'
  ),

  constraint site_photos_alt_text_check check (
    alt_text is null or char_length(btrim(alt_text)) between 1 and 200
  )
);

comment on table public.site_photos is
  'Foto de cada espaço fixo do site (arquivos no bucket "pets"). Sem linha = o site usa a ilustração padrão.';

create trigger site_photos_set_updated_at
  before update on public.site_photos
  for each row
  execute function public.set_updated_at();

alter table public.site_photos enable row level security;

create policy "site_photos: publico le"
  on public.site_photos
  for select
  to anon, authenticated
  using (true);

create policy "site_photos: admin cadastra"
  on public.site_photos
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "site_photos: admin edita"
  on public.site_photos
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Remover a linha = voltar à ilustração padrão daquele espaço.
create policy "site_photos: admin remove"
  on public.site_photos
  for delete
  to authenticated
  using ((select public.is_admin()));

revoke all on table public.site_photos from anon, authenticated;
grant select on table public.site_photos to anon;
grant select, insert, update, delete on table public.site_photos to authenticated;

commit;
