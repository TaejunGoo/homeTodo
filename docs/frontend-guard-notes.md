# Frontend Guard Notes

## Why Guards Exist

Frontend guards are small checks that stop an action before it reaches an invalid or unsafe state.
They often look obvious after they are written, but they usually come from real app failure cases.

Examples:

```ts
if (!id) return;
if (!currentSpaceId) return;
if (trimmedTitle.length === 0) return;
if (isSubmitting) return;
```

These are not a replacement for DB constraints, RLS, or RPC checks.
They are the UX layer that prevents confusing states and unnecessary requests.

## Common Guard Types

### Required Data Guard

Use this when an action needs a value that may not exist yet.

Examples:

- route params such as `id`
- selected Space id
- current user id
- loaded DB row

```ts
if (!id) {
  setErrorMessage('TODO를 찾지 못했어요.');
  return;
}
```

Why it matters:

- Expo Router params may be missing or delayed.
- A screen can render before async state is ready.
- A user can navigate quickly while state is changing.

### Input Guard

Use this before sending user input to the DB.

```ts
if (trimmedTitle.length === 0) {
  setErrorMessage('제목을 입력해 주세요.');
  return;
}
```

Why it matters:

- Disabled buttons improve UX but are not enough.
- Keyboard submit can still call the handler.
- DB constraints should not be the first place the user learns about invalid input.

### In-Progress Guard

Use this to avoid duplicate requests.

```tsx
<Pressable disabled={isSubmitting} onPress={handleSubmit} />
```

Sometimes the handler should also guard:

```ts
if (isSubmitting) {
  return;
}
```

Why it matters:

- Users can tap quickly.
- Network requests can take time.
- Create/update/delete actions should usually not run twice.

### Permission/State Guard

Use this when the UI depends on app state or role.

```ts
if (!canCreateInvite) {
  setErrorMessage('초대 코드는 소유자 또는 관리자만 만들 수 있어요.');
  return;
}
```

Why it matters:

- UI permissions are for clarity.
- DB permissions are the real boundary.
- The frontend should still explain why an action is unavailable.

## Async Action Template

Most create/update/delete handlers follow this shape:

```ts
async function handleAction() {
  if (!requiredValue) {
    setErrorMessage('필요한 정보를 찾지 못했어요.');
    return;
  }

  if (!isValidInput) {
    setErrorMessage('입력값을 확인해 주세요.');
    return;
  }

  setErrorMessage('');
  setIsSubmitting(true);

  try {
    await doSomething();
    Toast.show({
      type: 'success',
      text1: '처리했어요.',
    });
    router.back();
  } catch {
    setErrorMessage('처리하지 못했어요.');
  } finally {
    setIsSubmitting(false);
  }
}
```

The important parts:

- Guard early.
- Clear old errors before the request.
- Set loading state before the request.
- Show success feedback only after success.
- Always reset loading in `finally`.

## Applied Examples In homeTodo

### Create TODO

```ts
if (!currentSpaceId) {
  setErrorMessage('먼저 스페이스를 선택해 주세요.');
  return;
}

if (trimmedTitle.length === 0) {
  setErrorMessage('제목을 입력해 주세요.');
  return;
}
```

### Edit TODO

```ts
if (!id) {
  setErrorMessage('TODO를 찾지 못했어요.');
  return;
}
```

### Delete TODO

The UI says "delete", but the DB currently performs a soft delete by setting `is_active = false`.
The user-facing word should match the user's mental model.
The backend implementation can use safer internal language.

```ts
await deactivateChore(id);
Toast.show({
  type: 'success',
  text1: 'TODO를 삭제했어요.',
});
```

## Mental Checklist

Before writing a button handler, ask:

- What value must exist for this action to make sense?
- Can the user input be invalid?
- Can this action be triggered twice?
- What should the user see while the request is running?
- What happens if the request fails?
- Is this only a UX guard, or must the DB also enforce it?
