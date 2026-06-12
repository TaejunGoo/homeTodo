create or replace function public.shares_space_with_user(
  target_user_id uuid,
  viewer_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.space_members target_member
    join public.space_members viewer_member
      on viewer_member.space_id = target_member.space_id
    where target_member.user_id = target_user_id
      and viewer_member.user_id = viewer_user_id
  );
$$;

revoke all on function public.shares_space_with_user(uuid, uuid) from public;
grant execute on function public.shares_space_with_user(uuid, uuid) to authenticated;

create policy "Space members can view profiles in shared spaces"
on public.profiles
for select
to authenticated
using (
  auth.uid() is not null
  and public.shares_space_with_user(id, auth.uid())
);
