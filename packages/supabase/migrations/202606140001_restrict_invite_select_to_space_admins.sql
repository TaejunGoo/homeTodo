drop policy if exists "Space members can view space invites"
on public.space_invites;

create policy "Space admins can view space invites"
on public.space_invites
for select
to authenticated
using (
  auth.uid() is not null
  and public.is_space_admin(space_id, auth.uid())
);
