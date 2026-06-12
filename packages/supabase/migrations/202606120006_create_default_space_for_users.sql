insert into public.profiles (id, display_name)
select
  users.id,
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(users.email, '@', 1), ''),
    '사용자'
  )
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);

with users_without_space as (
  select users.id as user_id
  from auth.users
  where not exists (
    select 1
    from public.space_members
    where space_members.user_id = users.id
  )
),
created_spaces as (
  insert into public.spaces (name, created_by)
  select '내 스페이스', user_id
  from users_without_space
  returning id, created_by
)
insert into public.space_members (space_id, user_id)
select id, created_by
from created_spaces;

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
      '사용자'
    )
  )
  on conflict (id) do nothing;

  insert into public.spaces (name, created_by)
  values ('내 스페이스', new.id)
  returning id into created_space_id;

  insert into public.space_members (space_id, user_id)
  values (created_space_id, new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
