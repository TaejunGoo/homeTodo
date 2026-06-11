# Supabase migrations

This directory stores SQL migration files for the homeTodo Supabase database.

The first database schema and RLS policies were created manually in the Supabase Dashboard SQL Editor while learning.
These files capture that current schema as source-controlled SQL so the database model can be reviewed and recreated later.

Important:

- The remote Supabase project may already contain these schema changes.
- Do not blindly run `supabase db push` against that remote until migration history has been aligned.
- Supabase recommends managing schema changes through migration files once migrations are introduced.
- If remote schema changes were made directly through the Dashboard, use the Supabase CLI workflow such as `supabase db pull` or `supabase migration repair` before adopting `db push` as the source of truth.

Suggested future layout:

```text
packages/supabase/migrations/
  202606110001_initial_schema.sql
  202606110002_indexes.sql
  202606110003_rls_policies.sql
```
