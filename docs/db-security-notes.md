# DB Security Notes

## Current MVP Baseline

The app now treats `space_members` as the source of space permissions.

```text
owner
= Space creator. Can create invite codes.

admin
= Space manager. Can create invite codes.

member
= Regular member. Can view and participate, but cannot create invite codes.
```

The frontend reads the current user's role through `currentSpace.role` and uses it for UI:

- Show role badges on the current Space card.
- Show role badges in the Space selection screen.
- Disable invite-code creation for `member`.
- Show member roles in the Settings member list.

This frontend role check is for user experience only. The real permission boundary is still in the database.

## RPC First For Sensitive Writes

Simple reads can use table queries with RLS:

```ts
supabase.from('spaces').select(...)
supabase.from('space_members').select(...)
```

Sensitive writes should go through RPCs:

```ts
supabase.rpc('create_space', ...)
supabase.rpc('create_invite_code', ...)
supabase.rpc('join_space_with_invite_code', ...)
```

This keeps users from directly manipulating important columns such as:

- `space_invites.expires_at`
- `space_invites.max_uses`
- `space_invites.used_count`
- `space_invites.created_by`
- `space_members.role`

The client asks for an action. The DB function decides the actual row values.

## Invite Code Rules

`create_invite_code(target_space_id)` now enforces:

- The caller must be authenticated.
- The caller must be `owner` or `admin` in that Space.
- The same user's previous active invite code for that Space is expired.
- The new invite code expires after 1 day.
- The new invite code has `max_uses = 5`.

`join_space_with_invite_code(invite_code)` now inserts joined users as `member`.

## PL/pgSQL Ambiguous Column Lesson

In PL/pgSQL, output columns declared by `returns table (...)` can behave like variables inside the function.
If an output column and a table column have the same name, unqualified references can become ambiguous.

Problem:

```sql
and (expires_at is null or expires_at > now())
```

Safer:

```sql
and (space_invites.expires_at is null or space_invites.expires_at > now())
```

The `create_invite_code` RPC failed with HTTP 400 because `expires_at` existed both as a return column and as a table column.
The fix was to qualify the table column as `space_invites.expires_at`.

## Debugging RPC Errors

When the app only shows a generic 400 error:

1. Check the Supabase Dashboard logs.
2. Reproduce the RPC in SQL Editor with `set local role authenticated`.
3. Verify `auth.uid()` and role rows.
4. Check the exact Postgres error message.

Example:

```sql
begin;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'USER_UUID', true);

select auth.uid();
select public.is_space_admin('SPACE_UUID', 'USER_UUID');
select * from public.create_invite_code('SPACE_UUID');

rollback;
```
