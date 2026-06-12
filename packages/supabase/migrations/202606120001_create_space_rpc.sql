create or replace function public.create_space(space_name text)
returns table (
  id uuid,
  name text
)
language plpgsql
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

  insert into public.space_members (space_id, user_id)
  values (created_space_id, current_user_id);

  return query
  select created_space_id, created_space_name;
end;
$$;

revoke all on function public.create_space(text) from public;
grant execute on function public.create_space(text) to authenticated;
