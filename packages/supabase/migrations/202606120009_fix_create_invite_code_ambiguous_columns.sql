create or replace function public.create_invite_code(target_space_id uuid)
returns table (
  id uuid,
  code text,
  expires_at timestamptz,
  max_uses integer,
  used_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  generated_code text;
  created_invite_id uuid;
  created_expires_at timestamptz;
  created_max_uses integer;
  created_used_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if not public.is_space_admin(target_space_id, current_user_id) then
    raise exception 'Space admin permission required.';
  end if;

  update public.space_invites
  set expires_at = now()
  where space_invites.space_id = target_space_id
    and space_invites.created_by = current_user_id
    and (space_invites.expires_at is null or space_invites.expires_at > now());

  loop
    select string_agg(
      substr(alphabet, (floor(random() * length(alphabet))::int + 1), 1),
      ''
    )
    into generated_code
    from generate_series(1, 8);

    exit when not exists (
      select 1
      from public.space_invites
      where space_invites.code = generated_code
    );
  end loop;

  insert into public.space_invites (
    space_id,
    code,
    created_by,
    expires_at,
    max_uses
  )
  values (
    target_space_id,
    generated_code,
    current_user_id,
    now() + interval '1 day',
    5
  )
  returning
    space_invites.id,
    space_invites.expires_at,
    space_invites.max_uses,
    space_invites.used_count
  into
    created_invite_id,
    created_expires_at,
    created_max_uses,
    created_used_count;

  return query
  select
    created_invite_id,
    generated_code,
    created_expires_at,
    created_max_uses,
    created_used_count;
end;
$$;

revoke all on function public.create_invite_code(uuid) from public;
grant execute on function public.create_invite_code(uuid) to authenticated;
