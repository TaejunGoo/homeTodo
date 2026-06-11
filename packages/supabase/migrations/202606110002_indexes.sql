create index space_members_user_id_idx
  on public.space_members (user_id);

create index space_members_space_id_idx
  on public.space_members (space_id);

create index spaces_created_by_idx
  on public.spaces (created_by);

create index space_invites_space_id_idx
  on public.space_invites (space_id);

create index space_invites_code_idx
  on public.space_invites (code);

create index chores_space_id_idx
  on public.chores (space_id);

create index chores_space_id_is_active_idx
  on public.chores (space_id, is_active);

create index chore_completions_space_id_idx
  on public.chore_completions (space_id);

create index chore_completions_chore_id_idx
  on public.chore_completions (chore_id);

create index chore_completions_target_period_start_idx
  on public.chore_completions (target_period_start);

create index chore_completion_events_space_id_idx
  on public.chore_completion_events (space_id);

create index chore_completion_events_chore_id_idx
  on public.chore_completion_events (chore_id);

create index chore_completion_events_target_period_start_idx
  on public.chore_completion_events (target_period_start);

