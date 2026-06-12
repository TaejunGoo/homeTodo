alter table public.space_members
add column if not exists role text not null default 'member';

alter table public.space_members
drop constraint if exists space_members_role_check;

alter table public.space_members
add constraint space_members_role_check
check (role in ('owner', 'admin', 'member'));

update public.space_members
set role = 'owner'
from public.spaces
where space_members.space_id = spaces.id
  and space_members.user_id = spaces.created_by;

create or replace function public.is_space_admin(
  target_space_id uuid,
  target_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.space_members
    where space_id = target_space_id
      and user_id = target_user_id
      and role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_space_admin(uuid, uuid) from public;

revoke insert on public.spaces from authenticated;
revoke insert, update, delete on public.space_members from authenticated;
revoke insert, update, delete on public.space_invites from authenticated;

drop policy if exists "Authenticated users can create spaces"
on public.spaces;

drop policy if exists "Space creators can add themselves as members"
on public.space_members;

drop policy if exists "Space members can create space invites"
on public.space_invites;

drop policy if exists "Space members can update space invites"
on public.space_invites;

create or replace function public.create_space(space_name text)
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
  trimmed_space_name text := btrim(space_name);
  created_space_id uuid;
  created_space_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required.';
  end if;

  if trimmed_space_name = '' then
    raise exception 'Space name is required.';
  end if;

  insert into public.spaces (name, created_by)
  values (trimmed_space_name, current_user_id)
  returning spaces.id, spaces.name
  into created_space_id, created_space_name;

  insert into public.space_members (space_id, user_id, role)
  values (created_space_id, current_user_id, 'owner');

  return query
  select created_space_id, created_space_name;
end;
$$;

revoke all on function public.create_space(text) from public;
grant execute on function public.create_space(text) to authenticated;

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

  if normalized_code is null or normalized_code = '' then
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
    and (space_invites.expires_at is null or space_invites.expires_at > now())
    and (
      space_invites.max_uses is null
      or space_invites.used_count < space_invites.max_uses
    );

  if not found then
    raise exception 'Invite code is no longer available.';
  end if;

  insert into public.space_members (space_id, user_id, role)
  values (invite_record.space_id, current_user_id, 'member');

  return query
  select invite_record.space_id, invite_record.space_name;
end;
$$;

revoke all on function public.join_space_with_invite_code(text) from public;
grant execute on function public.join_space_with_invite_code(text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_space_id uuid;
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'User'
    )
  )
  on conflict (id) do nothing;

  insert into public.spaces (name, created_by)
  values ('My Space', new.id)
  returning id into created_space_id;

  insert into public.space_members (space_id, user_id, role)
  values (created_space_id, new.id, 'owner');

  return new;
end;
$$;
