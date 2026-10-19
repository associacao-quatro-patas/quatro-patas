-- =============================================================================
-- Quatro Patas · Migração 002 · Políticas do Storage para o bucket "pets"
-- =============================================================================
-- Pré-requisitos:
--   * Migração 001 aplicada (tabela public.admins e função public.is_admin()).
--   * Bucket "pets" já criado como PÚBLICO no painel do Supabase.
--
-- Quem pode fazer o quê:
--   * Visitantes: veem as imagens pela URL pública do bucket
--     (/storage/v1/object/public/pets/...). Isso vem da opção "Public bucket",
--     que não depende de políticas, então nenhuma política é necessária aqui.
--   * Administradores (presentes em public.admins): listam, enviam, substituem
--     e excluem arquivos do bucket "pets".
--   * Demais usuários logados: nenhuma permissão de escrita.
--
-- Segurança da execução:
--   * Apenas CRIA políticas novas em storage.objects. Não altera o bucket, não
--     mexe em arquivos e não remove nem modifica políticas existentes.
--   * Se já houver uma política com algum destes nomes, o script falha e a
--     transação inteira é desfeita, sem aplicar nada.
-- =============================================================================

begin;

-- Listar e ler pela API autenticada. Também é exigido pelo Storage para
-- substituir arquivos (upsert) e para excluí-los.
create policy "pets bucket: admin le arquivos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pets'
    and (select public.is_admin())
  );

-- Enviar novos arquivos, aceitando apenas extensões de imagem.
create policy "pets bucket: admin envia imagens"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pets'
    and (select public.is_admin())
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
  );

-- Substituir arquivos existentes. O WITH CHECK impede mover um arquivo para
-- outro bucket ou trocá-lo por uma extensão que não seja de imagem.
create policy "pets bucket: admin atualiza imagens"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'pets'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'pets'
    and (select public.is_admin())
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
  );

-- Excluir arquivos.
create policy "pets bucket: admin exclui imagens"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pets'
    and (select public.is_admin())
  );

commit;

-- -----------------------------------------------------------------------------
-- NÃO incluído de propósito: uma política de SELECT para `anon`.
-- Ela não é necessária para exibir as imagens (a URL pública já funciona) e
-- permitiria que qualquer pessoa LISTASSE todos os arquivos do bucket pela API.
-- Só ative se um dia houver motivo para isso:
--
-- create policy "pets bucket: publico lista arquivos"
--   on storage.objects for select to anon, authenticated
--   using (bucket_id = 'pets');
-- -----------------------------------------------------------------------------
