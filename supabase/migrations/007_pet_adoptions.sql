-- =============================================================================
-- Quatro Patas · Migração 007 · Adotados e Mural de Adoções
-- =============================================================================
-- PROPOSTA: ainda NÃO aplicada. Revise antes de executar no SQL Editor.
--
-- O que esta migração faz:
--   * Reutiliza a tabela `pets`: um animal adotado continua sendo o MESMO
--     registro (mesma foto e dados), só com status = 'adopted'.
--   * Cria `pet_adoptions`: dados PRIVADOS da adoção (tutor e data), no
--     máximo uma linha por animal (pet_id único → sem duplicatas).
--     RLS e permissões: somente administradores leem e alteram. Visitantes
--     (anon) não têm nenhum acesso à tabela, nem pela API.
--   * Cria `register_adoption(...)`: em UMA transação marca o animal como
--     adotado e grava (ou atualiza) os dados do tutor. Só administradores.
--   * Cria `adoption_mural()`: lista pública do Mural de Adoções que devolve
--     SOMENTE id, nome e foto dos animais adotados. Nenhum dado do tutor.
--
-- Segurança da execução:
--   * Não altera nem apaga nada existente: `pets`, suas políticas (adotados
--     continuam fora da listagem pública de disponíveis), admins, Storage,
--     doações, insumos, conteúdo institucional e fotos do site.
--   * Reutiliza public.is_admin() e public.set_updated_at() (001) sem alterá-las.
--   * Não insere dados. Animais que já estavam como "Adotado" aparecem na aba
--     Adotados sem dados do tutor, para o administrador completar.
--   * Se algum objeto já existir, o script falha e nada é aplicado.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Dados privados da adoção
-- -----------------------------------------------------------------------------
create table public.pet_adoptions (
  id            uuid primary key default gen_random_uuid(),
  -- Um registro de adoção por animal. Excluir o animal apaga a adoção.
  pet_id        uuid not null unique references public.pets (id) on delete cascade,
  tutor_name    text not null,
  tutor_contact text not null,
  tutor_address text,
  adopted_at    date not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint pet_adoptions_tutor_name_check
    check (char_length(btrim(tutor_name)) between 1 and 120),
  constraint pet_adoptions_tutor_contact_check
    check (char_length(btrim(tutor_contact)) between 1 and 120),
  constraint pet_adoptions_tutor_address_check
    check (tutor_address is null or char_length(btrim(tutor_address)) between 1 and 300),
  constraint pet_adoptions_adopted_at_check
    check (adopted_at >= date '1990-01-01')
);

comment on table public.pet_adoptions is
  'Dados PRIVADOS da adoção (tutor e data). Somente administradores. O site público nunca lê esta tabela.';

create trigger pet_adoptions_set_updated_at
  before update on public.pet_adoptions
  for each row
  execute function public.set_updated_at();

alter table public.pet_adoptions enable row level security;

create policy "pet_adoptions: admin ve"
  on public.pet_adoptions
  for select
  to authenticated
  using ((select public.is_admin()));

create policy "pet_adoptions: admin cadastra"
  on public.pet_adoptions
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "pet_adoptions: admin edita"
  on public.pet_adoptions
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "pet_adoptions: admin exclui"
  on public.pet_adoptions
  for delete
  to authenticated
  using ((select public.is_admin()));

-- Visitantes não recebem NENHUMA permissão nesta tabela.
revoke all on table public.pet_adoptions from public, anon, authenticated;
grant select, insert, update, delete on table public.pet_adoptions to authenticated;

-- -----------------------------------------------------------------------------
-- Registrar adoção (status + tutor na mesma transação)
-- -----------------------------------------------------------------------------
-- security invoker: roda com as permissões de quem chama, então as políticas
-- RLS de `pets` e `pet_adoptions` também se aplicam.
create function public.register_adoption(
  p_pet_id        uuid,
  p_tutor_name    text,
  p_tutor_contact text,
  p_tutor_address text,
  p_adopted_at    date
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Apenas administradores podem registrar adoções.' using errcode = '42501';
  end if;

  update public.pets set status = 'adopted' where id = p_pet_id;
  if not found then
    raise exception 'Animal não encontrado.' using errcode = 'P0002';
  end if;

  insert into public.pet_adoptions (pet_id, tutor_name, tutor_contact, tutor_address, adopted_at)
  values (
    p_pet_id,
    btrim(p_tutor_name),
    btrim(p_tutor_contact),
    nullif(btrim(coalesce(p_tutor_address, '')), ''),
    p_adopted_at
  )
  on conflict (pet_id) do update
    set tutor_name    = excluded.tutor_name,
        tutor_contact = excluded.tutor_contact,
        tutor_address = excluded.tutor_address,
        adopted_at    = excluded.adopted_at;
end;
$$;

comment on function public.register_adoption(uuid, text, text, text, date) is
  'Marca o animal como adotado e grava/atualiza os dados do tutor numa única transação (somente administradores).';

revoke execute on function public.register_adoption(uuid, text, text, text, date) from public, anon;
grant execute on function public.register_adoption(uuid, text, text, text, date) to authenticated;

-- -----------------------------------------------------------------------------
-- Mural de Adoções (público): apenas id, nome e foto
-- -----------------------------------------------------------------------------
-- security definer: lê os adotados (que a política pública de `pets` esconde)
-- mas devolve só três colunas. A data da adoção é usada apenas para ordenar.
create function public.adoption_mural()
returns table (id uuid, name text, photo_path text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.photo_path
  from public.pets p
  left join public.pet_adoptions a on a.pet_id = p.id
  where p.status = 'adopted'
  order by a.adopted_at desc nulls last, p.updated_at desc
$$;

comment on function public.adoption_mural() is
  'Mural público de adoções: somente id, nome e foto dos animais adotados (nenhum dado do tutor).';

revoke execute on function public.adoption_mural() from public;
grant execute on function public.adoption_mural() to anon, authenticated;

commit;
