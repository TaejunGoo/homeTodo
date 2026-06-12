create or replace function public.join_space_with_invite_code(invite_code text)
returns table (
  id uuid,
  name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_code text := upper(btrim(invite_code));
  invite_record record;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if normalized_code = '' then
    raise exception 'Invite code is required.';
  end if;

  select
    space_invites.id,
    space_invites.space_id,
    space_invites.expires_at,
    space_invites.max_uses,
    space_invites.used_count,
    spaces.name as space_name
  into invite_record
  from public.space_invites
  join public.spaces
    on spaces.id = space_invites.space_id
  where space_invites.code = normalized_code;

  if invite_record.id is null then
    raise exception 'Invalid invite code.';
  end if;

  if invite_record.expires_at is not null and invite_record.expires_at <= now() then
    raise exception 'Expired invite code.';
  end if;

  if exists (
    select 1
    from public.space_members
    where space_members.space_id = invite_record.space_id
      and space_members.user_id = current_user_id
  ) then
    return query
    select invite_record.space_id, invite_record.space_name;
    return;
  end if;

  update public.space_invites
  set used_count = used_count + 1
  where space_invites.id = invite_record.id
    and (
      space_invites.max_uses is null
      or space_invites.used_count < space_invites.max_uses
    );

  if not found then
    raise exception 'Invite code has reached its usage limit.';
  end if;

  insert into public.space_members (space_id, user_id)
  values (invite_record.space_id, current_user_id);

  return query
  select invite_record.space_id, invite_record.space_name;
end;
$$;

revoke all on function public.join_space_with_invite_code(text) from public;
grant execute on function public.join_space_with_invite_code(text) to authenticated;
