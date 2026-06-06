# homeTodo Figma AI 프롬프트

## 1. 사용 방법

이 문서는 Figma AI로 homeTodo 앱의 와이어프레임과 초기 UI 시안을 생성하기 위한 프롬프트 모음이다.

권장 사용 순서:

1. `2. 전체 앱 생성 프롬프트`를 먼저 입력한다.
2. 결과가 너무 뭉개지면 `3. 화면별 세부 프롬프트`를 화면 단위로 다시 입력한다.
3. 공통 컴포넌트가 부족하면 `4. 컴포넌트 세트 프롬프트`를 입력한다.
4. 생성 결과가 기획과 달라지면 `docs/homeTodo-planning.md`와 `docs/homeTodo-curriculum.md`를 함께 수정한다.

## 2. 전체 앱 생성 프롬프트

```text
Create a mobile app UI design for an app called "homeTodo".

homeTodo is a shared household chore TODO app for iOS and Android, built with React Native and Expo. Users belong to a shared "Space" such as "우리집", "자취방", or "가족집". Inside each Space, members manage recurring household chores together. The MVP uses simple email/password login with pre-created accounts. It does not include push notifications, magic links, OAuth, advanced roles, or marketplace distribution.

Design style:
- Follow Apple Human Interface Guidelines.
- Minimal, calm, practical, and native-mobile feeling.
- Clean spacing, clear hierarchy, restrained colors.
- Support both light mode and dark mode.
- Avoid marketing-style hero sections.
- Avoid heavy gradients, decorative blobs, and overly playful visuals.
- Use simple rounded corners, subtle dividers, and clear tap targets.
- Use SF Pro-like typography.
- Make the UI feel like a real utility app used repeatedly at home.

Target frame:
- iPhone 15 size or similar mobile frame.
- Create both light mode and dark mode examples if possible.
- Use Korean UI text.

Core MVP concept:
- Chores are recurring by period, not by exact date.
- A weekly chore means "complete this once during the current week".
- A monthly chore means "complete this once during the current month".
- Chores are grouped by recurrence period.
- Every Space member has the same permission: create, edit, delete, and complete chores.

Create these screens:
1. Login
2. Space Dashboard
3. Space Picker Modal
4. Create Space
5. Invite Code Display and Join by Invite Code
6. Create/Edit TODO
7. All TODOs
8. Completion History
9. Space Settings
10. Empty, Loading, and Error states

Global layout:
- Top app header on main screens.
- Header left: current Space selector with a chevron/down arrow icon and Space name.
- Tapping the left header area opens the Space Picker Modal.
- Header right: plus icon button for creating a new Space.
- Floating action button at bottom right with plus icon for creating a TODO.
- Main dashboard body shows period containers grouped by recurrence period.
- Bottom action area on form screens for primary and secondary actions.

Main components to design:
- AppHeader
- SpacePickerModal
- TextInput
- PrimaryButton
- SecondaryButton
- IconButton
- FloatingActionButton
- PeriodSection
- ChoreListItem
- CompletionListItem
- SpaceListItem
- DropdownMenu
- EmptyState
- ErrorState

Screen details:

Login screen:
- App name: homeTodo
- Email input
- Password input
- Primary login button
- Small helper text saying this MVP uses pre-created test accounts
- Minimal, centered layout

Space Dashboard:
- AppHeader with Space name, for example "우리집"
- PeriodSection list grouped by "매일", "매주", "매월", "N일마다"
- Each PeriodSection shows a title label, completed count, total count, and ChoreListItems
- Show an invite button or small action near the dashboard header: "초대 코드"
- Floating plus button at bottom right for creating a TODO
- Include example chores:
  - "분리수거"
  - "화장실 청소"
  - "침구 세탁"
  - "냉장고 정리"

PeriodSection:
- Use subtle visual distinction by period, such as light tinted border or small colored label
- Avoid strong color blocks
- Show title, progress text like "2/4 완료", and list of TODO items
- If all items are complete, show a soft completed visual state

ChoreListItem:
- Left checkbox
- Chore title
- Optional small recurrence/status text
- Right overflow menu icon "..."
- Default state
- Completed state: checked checkbox, slightly muted title, completed visual treatment
- Skipped state may be shown as a future-state concept, but label it visually as optional/future
- Dropdown menu includes "수정", "삭제"; "스킵" can be shown as future/optional if included

Space Picker Modal:
- Bottom sheet or centered modal
- Title: "스페이스 선택"
- List of joined Spaces
- Current Space selected state
- Button or row for "초대 코드로 참여"
- Close icon

Create Space screen:
- Title: "스페이스 만들기"
- Space name input
- Bottom primary button "생성"
- Bottom secondary button "취소"
- Disabled state when input is empty

Invite Code UI:
- A display screen or modal for generated invite code
- Title: "초대 코드"
- Large readable code, for example "A8K2QZ"
- Expiration text, for example "30분 동안 유효해요"
- Copy button
- Close button
- Also create a join-by-code input state with code input and "참여" button
- Show success and error feedback states

Create/Edit TODO screen:
- Title: "TODO 만들기" or "TODO 수정"
- Text input for chore title
- Recurrence selector with options:
  - "매일"
  - "매주"
  - "매월"
  - "N일마다"
- Include "연간" and "커스텀" only as disabled/future options if shown
- For "N일마다", show a numeric input field
- Bottom primary button "생성" or "저장"
- Bottom secondary button "취소"
- In edit mode, include destructive action "삭제"

All TODOs screen:
- Header
- List all active chores
- Group or filter by recurrence type
- Each item has title, recurrence label, overflow menu
- Provide add TODO action

Completion History screen:
- List completed chores by date or period
- CompletionListItem shows chore title, completed by, completed time
- Example completed by names: "태준", "민지"
- Keep history readable and compact

Space Settings screen:
- Space name
- Member list
- Invite code generation/copy action
- Logout action
- Keep permission management out of MVP

Empty/Loading/Error states:
- Empty dashboard: "아직 등록된 집안일이 없어요" with button "TODO 만들기"
- Empty Space: "스페이스가 없어요" with button "스페이스 만들기"
- Loading state with simple spinner or skeleton
- Error state with short message and "다시 시도" button

Design tokens:
- Define light and dark backgrounds
- Define primary text, secondary text, divider, input background, card background
- Define primary action color
- Define semantic colors for completed, warning/error, and period labels
- Ensure enough contrast in both light and dark mode

Output:
- Make clean, editable Figma frames.
- Name layers and components clearly.
- Keep the design simple enough to implement in React Native.
```

## 3. 화면별 세부 프롬프트

### 3.1 로그인

```text
Design a minimal Korean mobile login screen for "homeTodo", a shared household chore TODO app.

Style:
- Apple Human Interface Guidelines inspired
- Minimal, native iOS-like
- Light and dark mode friendly
- No illustrations or marketing hero

Elements:
- App title: homeTodo
- Short subtitle: "함께 관리하는 집안일 TODO"
- Email text input
- Password text input
- Primary button: "로그인"
- Helper text: "MVP에서는 미리 생성된 테스트 계정으로 로그인해요"
- Error message state for invalid login

Use clear spacing, large touch targets, and simple typography.
```

### 3.2 Space 대시보드

```text
Design the main Space Dashboard screen for homeTodo in Korean.

Purpose:
- Show household chores grouped by recurrence period.
- The current Space is "우리집".

Header:
- Left area: chevron/down icon + "우리집"
- Tapping this opens Space Picker Modal
- Right area: plus icon button for creating a new Space

Body:
- Show a small invite code action: "초대 코드"
- Show period containers:
  - 매일
  - 매주
  - 매월
  - N일마다
- Each period container shows progress like "2/4 완료"
- Each container contains TODO item rows

Floating action:
- Bottom-right plus floating action button for creating a TODO

Example TODOs:
- 분리수거
- 화장실 청소
- 침구 세탁
- 냉장고 정리

States:
- Some TODOs complete, some incomplete
- Keep the screen compact, calm, and easy to scan.
```

### 3.3 Space 선택 모달

```text
Design a Space Picker bottom sheet modal for homeTodo.

Elements:
- Title: "스페이스 선택"
- Close icon
- List of Spaces:
  - 우리집
  - 자취방
  - 가족집
- Current Space selected state with checkmark
- Row or secondary button: "초대 코드로 참여"
- Optional row: "새 스페이스 만들기"

Style:
- Native mobile bottom sheet
- Minimal, clear, touch-friendly
- Support light and dark mode
```

### 3.4 Space 생성

```text
Design a Create Space screen for homeTodo.

Elements:
- Header title: "스페이스 만들기"
- Text input label: "스페이스 이름"
- Placeholder: "예: 우리집"
- Primary bottom button: "생성"
- Secondary bottom button: "취소"
- Disabled primary button state when input is empty

Style:
- Minimal form screen
- Bottom fixed action area
- Apple HIG inspired spacing and typography
```

### 3.5 초대 코드 표시와 입력

```text
Design invite code UI for homeTodo.

Create two states:

1. Invite code display:
- Title: "초대 코드"
- Large readable code: "A8K2QZ"
- Expiration helper text: "30분 동안 유효해요"
- Primary button: "코드 복사"
- Secondary button: "닫기"

2. Join by invite code:
- Title: "초대 코드로 참여"
- Text input for code
- Primary button: "참여"
- Error state: "유효하지 않거나 만료된 코드예요"
- Success state: "스페이스에 참여했어요"

Style:
- Minimal mobile modal or screen
- Clear code readability
- Good light/dark mode contrast
```

### 3.6 TODO 생성/수정

```text
Design a Create/Edit TODO screen for homeTodo.

Elements:
- Header title: "TODO 만들기"
- Text input label: "제목"
- Placeholder: "예: 화장실 청소"
- Recurrence selector label: "반복 주기"
- Segmented control or selectable list:
  - 매일
  - 매주
  - 매월
  - N일마다
- For "N일마다", show numeric input: "반복 간격"
- Bottom primary button: "생성"
- Bottom secondary button: "취소"
- Edit mode variant:
  - Title: "TODO 수정"
  - Primary button: "저장"
  - Destructive button: "삭제"

Optional future options:
- Show "연간" and "커스텀" only if visually marked as future/disabled.

Style:
- Clean form layout
- Easy to implement in React Native
- Large tap targets
```

### 3.7 전체 TODO

```text
Design an All TODOs screen for homeTodo.

Purpose:
- Show all active chores in the current Space.

Elements:
- AppHeader with current Space
- Filter or grouped sections by recurrence:
  - 매일
  - 매주
  - 매월
  - N일마다
- TODO list rows with title, recurrence label, overflow menu
- Add TODO action using floating plus button or header button
- Empty state if no TODO exists

Style:
- Dense but readable
- Minimal utility app feeling
```

### 3.8 완료 이력

```text
Design a Completion History screen for homeTodo.

Elements:
- Header title: "완료 이력"
- List grouped by date or period
- Completion item shows:
  - chore title
  - completed by name
  - completed time
- Example:
  - "화장실 청소"
  - "태준이 완료"
  - "오늘 18:20"
- Empty state: "아직 완료 이력이 없어요"

Style:
- Compact, timeline-like but simple
- Easy to scan
- Light/dark mode friendly
```

### 3.9 Space 설정

```text
Design a Space Settings screen for homeTodo.

Elements:
- Header title: "설정"
- Current Space name: "우리집"
- Member list:
  - 태준
  - 민지
- Invite section:
  - Button: "초대 코드 만들기"
  - Button or row: "초대 코드 복사"
- Logout button
- Do not include role management, admin settings, or permission levels.

Style:
- Simple settings list
- Native mobile style
- Clear destructive/logout treatment
```

## 4. 컴포넌트 세트 프롬프트

```text
Create a component set for homeTodo, a minimal shared household chore TODO app.

Style:
- Apple Human Interface Guidelines inspired
- Light mode and dark mode variants
- Simple, reusable, React Native friendly

Components:

1. AppHeader
- Space selector on left: chevron icon + Space name
- Plus icon button on right for creating Space
- Variants: with Space, no Space, loading

2. TextInput
- Label
- Placeholder
- Value
- Error message
- Disabled state
- Light/dark variants

3. PrimaryButton
- Default
- Pressed
- Disabled
- Loading

4. SecondaryButton
- Default
- Pressed
- Disabled

5. IconButton
- Plus
- More horizontal
- Close
- Chevron down

6. FloatingActionButton
- Plus icon
- Default
- Pressed
- Disabled

7. PeriodSection
- Title: 매일, 매주, 매월, N일마다
- Progress text: 2/4 완료
- Variants: default, all complete, empty
- Subtle period color distinction

8. ChoreListItem
- Checkbox
- Chore title
- Optional helper text
- Overflow menu icon
- Variants: incomplete, completed, skipped future-state

9. DropdownMenu
- Items: 수정, 삭제
- Optional future item: 스킵
- Destructive styling for 삭제

10. SpaceListItem
- Space name
- Member count
- Current selected state

11. CompletionListItem
- Chore title
- Completed by
- Completed time

12. EmptyState
- Short message
- Optional primary action

13. ErrorState
- Error message
- Retry button

Use Korean sample text.
Keep components clean, named, and easy to convert into React Native components.
```

