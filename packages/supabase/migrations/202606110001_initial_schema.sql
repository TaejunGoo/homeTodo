create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.space_members (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),

  constraint space_members_space_id_user_id_key unique (space_id, user_id)
);

create table public.space_invites (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now(),

  constraint space_invites_max_uses_check check (max_uses is null or max_uses > 0),
  constraint space_invites_used_count_check check (used_count >= 0)
);

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null,
  description text,
  recurrence_type text not null,
  recurrence_value integer,
  start_date date not null,
  is_active boolean not null default true,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chores_recurrence_type_check
    check (recurrence_type in ('daily', 'weekly', 'monthly', 'interval_days')),

  constraint chores_interval_days_check
    check (
      recurrence_type <> 'interval_days'
      or (recurrence_value is not null and recurrence_value > 0)
    )
);

create table public.chore_completions (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  completed_by uuid not null references public.profiles(id) on delete restrict,
  target_period_start date not null,
  completed_at timestamptz not null default now(),
  note text,

  constraint chore_completions_chore_id_target_period_start_key
    unique (chore_id, target_period_start)
);

create table public.chore_completion_events (
  id uuid primary key default gen_random_uuid(),
  chore_id uuid not null references public.chores(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  target_period_start date not null,
  event_type text not null,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),

  constraint chore_completion_events_event_type_check
    check (event_type in ('completed', 'uncompleted'))
);

