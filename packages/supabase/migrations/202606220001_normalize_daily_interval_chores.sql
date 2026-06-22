update public.chores
set
  recurrence_type = 'daily',
  recurrence_value = null,
  updated_at = now()
where recurrence_type = 'interval_days'
  and recurrence_value = 1;

alter table public.chores
drop constraint chores_interval_days_check;

alter table public.chores
add constraint chores_interval_days_check
  check (
    recurrence_type <> 'interval_days'
    or (recurrence_value is not null and recurrence_value > 1)
  );
