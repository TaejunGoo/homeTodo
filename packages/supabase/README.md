# Supabase migrations

This directory stores SQL migration files for the homeTodo Supabase database.

The first database schema and RLS policies were created manually in the Supabase Dashboard SQL Editor while learning.
These files capture that current schema as source-controlled SQL so the database model can be reviewed and recreated later.

Related learning note: [`docs/db-security-notes.md`](../../docs/db-security-notes.md)

Important:

- The remote Supabase project may already contain these schema changes.
- Do not blindly run `supabase db push` against that remote until migration history has been aligned.
- Supabase recommends managing schema changes through migration files once migrations are introduced.
- If remote schema changes were made directly through the Dashboard, use the Supabase CLI workflow such as `supabase db pull` or `supabase migration repair` before adopting `db push` as the source of truth.

Current migration files:

```text
packages/supabase/migrations/
  202606110001_initial_schema.sql
  202606110002_indexes.sql
  202606110003_rls_policies.sql
  202606120001_create_space_rpc.sql
  202606120002_create_invite_code_rpc.sql
  202606120003_join_space_with_invite_code_rpc.sql
  202606120004_create_profiles_for_auth_users.sql
  202606120005_allow_shared_profile_reads.sql
  202606120006_create_default_space_for_users.sql
  202606120007_harden_space_security.sql
  202606120008_grant_space_admin_helper.sql
  202606120009_fix_create_invite_code_ambiguous_columns.sql
  202606140001_restrict_invite_select_to_space_admins.sql
  202606220001_normalize_daily_interval_chores.sql
```

Current MVP security baseline:

- Keep RLS enabled on all app tables.
- Use RPCs for multi-row or sensitive workflows:
  - `create_space`
  - `create_invite_code`
  - `join_space_with_invite_code`
- Treat `space_members` as the source of space permission truth.
- `space_members.role` uses `owner`, `admin`, and `member`.
- Only `owner` and `admin` members can create invite codes.
- Invite creation expires the same user's previous active invite code for the same space.
- Authenticated clients can read allowed space and membership rows through RLS. Invite rows are readable only by `owner` and `admin` members. Direct writes to `spaces`, `space_members`, and `space_invites` are restricted, and sensitive writes should go through RPCs.

Deferred until after MVP:

- Per-user creation rate limits.
- IP-based rate limits through Edge Functions and an external Redis provider.
- Audit logs for invite creation, joining, role changes, and destructive actions.
