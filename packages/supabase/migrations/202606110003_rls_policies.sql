grant usage on schema public to authenticated;

grant select, insert, update, delete
on table
  public.profiles,
  public.spaces,
  public.space_members,
  public.space_invites,
  public.chores,
  public.chore_completions,
  public.chore_completion_events
to authenticated;

alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.space_invites enable row level security;
alter table public.chores enable row level security;
alter table public.chore_completions enable row level security;
alter table public.chore_completion_events enable row level security;

create or replace function public.is_space_member(
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
  );
$$;

revoke all on function public.is_space_member(uuid, uuid) from public;
grant execute on function public.is_space_member(uuid, uuid) to authenticated;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = id
);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() is not null
  and auth.uid() = id
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  auth.uid() is not null
  and auth.uid() = id
)
with check (
  auth.uid() is not null
  and auth.uid() = id
);

create policy "Space members can view spaces"
on public.spaces
for select
to authenticated
using (
  auth.uid() is not null
  and (
    created_by = auth.uid()
    or public.is_space_member(id, auth.uid())
  )
);

create policy "Authenticated users can create spaces"
on public.spaces
for insert
to authenticated
with check (
  auth.uid() is not null
  and created_by = auth.uid()
);

create policy "Space members can update spaces"
on public.spaces
for update
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(id, auth.uid())
)
with check (
  auth.uid() is not null
  and public.is_space_member(id, auth.uid())
);

create policy "Space members can view space members"
on public.space_members
for select
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space creators can add themselves as members"
on public.space_members
for insert
to authenticated
with check (
  auth.uid() is not null
  and user_id = auth.uid()
  and exists (
    select 1
    from public.spaces
    where spaces.id = space_members.space_id
      and spaces.created_by = auth.uid()
  )
);

create policy "Space members can view space invites"
on public.space_invites
for select
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can create space invites"
on public.space_invites
for insert
to authenticated
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can update space invites"
on public.space_invites
for update
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
)
with check (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can view chores"
on public.chores
for select
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can create chores"
on public.chores
for insert
to authenticated
with check (
  auth.uid() is not null
  and created_by = auth.uid()
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can update chores"
on public.chores
for update
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
)
with check (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can delete chores"
on public.chores
for delete
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can view chore completions"
on public.chore_completions
for select
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can create chore completions"
on public.chore_completions
for insert
to authenticated
with check (
  auth.uid() is not null
  and completed_by = auth.uid()
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can delete chore completions"
on public.chore_completions
for delete
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can view chore completion events"
on public.chore_completion_events
for select
to authenticated
using (
  auth.uid() is not null
  and public.is_space_member(space_id, auth.uid())
);

create policy "Space members can create chore completion events"
on public.chore_completion_events
for insert
to authenticated
with check (
  auth.uid() is not null
  and actor_id = auth.uid()
  and public.is_space_member(space_id, auth.uid())
);
