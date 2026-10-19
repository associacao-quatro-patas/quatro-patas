-- =============================================================================
-- Quatro Patas · Migração 003 · Foto principal dos pets
-- =============================================================================
-- Adiciona a coluna `photo_path`: o nome do arquivo da foto dentro do bucket
-- "pets" (ex.: "3f6c...-....webp"). Fica vazia quando o animal não tem foto.
--
-- Segurança da execução:
--   * Apenas ADICIONA uma coluna opcional. Não recria, não apaga e não altera
--     dados, colunas ou políticas existentes.
--   * As políticas RLS da tabela pets (migração 001) já cobrem a nova coluna:
--     só administradores conseguem gravá-la e o público lê apenas os pets
--     exibíveis.
--   * Se a coluna já existir, o script falha e nada é aplicado.
-- =============================================================================

begin;

alter table public.pets
  add column photo_path text;

-- Nome gerado pelo site: um UUID seguido de uma extensão de imagem aceita
-- pelas políticas do Storage (migração 002).
alter table public.pets
  add constraint pets_photo_path_check
  check (
    photo_path is null
    or photo_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|avif)$'
  );

comment on column public.pets.photo_path is
  'Arquivo da foto principal no bucket "pets". Nulo quando não há foto.';

commit;
