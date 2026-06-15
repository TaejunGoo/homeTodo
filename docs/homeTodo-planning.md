# homeTodo 기획서 초안

## 1. 프로젝트 개요

homeTodo는 React Native와 Expo로 만드는 연습용 집안일 TODO 앱이다.
iOS와 Android에서 함께 사용할 수 있고, 앱스토어/플레이스토어에 배포하지 않고 Expo Go를 통해 직접 사용하는 것을 목표로 한다.

핵심 가치는 한 집, 커플, 룸메이트, 가족처럼 여러 사람이 하나의 TODO 공간을 공유하며 반복되는 집안일을 함께 관리하는 것이다.

## 2. 목표

- React Native, Expo, Supabase를 실제 앱 흐름 안에서 경험한다.
- iOS/Android 공용 모바일 앱을 만든다.
- 특정 TODO Space를 여러 유저가 공유하고 함께 편집할 수 있게 한다.
- 주기별 집안일 TODO를 만들고, 완료하고, 다음 주기로 이어지게 한다.
- 모노레포 구조를 사용해 모바일 앱, 공용 타입, Supabase 관련 코드를 분리한다.
- 완성도보다 학습 경험과 구조 이해를 우선한다.

## 3. 사용 시나리오

### 3.1 개인 사용자

- 혼자 사는 사용자가 청소, 빨래, 분리수거, 장보기 같은 반복 집안일을 등록한다.
- 매일/매주/매월 해야 할 일을 확인한다.
- 완료한 항목의 이력을 확인한다.

### 3.2 공유 공간 사용자

- 한 사용자가 TODO Space를 만든다.
- 초대 링크나 초대 코드로 다른 사용자가 같은 Space에 참여한다.
- Space 구성원들이 같은 TODO 목록을 보고 편집한다.
- 누가 어떤 집안일을 완료했는지 확인한다.

## 4. MVP 범위

첫 번째 완성 목표는 아래 기능까지로 한다.

- 사전에 생성된 Supabase Auth 계정으로 이메일/비밀번호 로그인
- 기본 TODO Space 자동 생성 및 추가 TODO Space 생성
- Space 초대 코드 생성 및 참여
- Space 멤버 목록 조회
- 반복 TODO 생성
- 반복 주기 설정
  - 매일
  - 매주
  - 매월
  - N일마다
- TODO 목록 조회
  - 오늘 할 일
  - 예정된 일
  - 완료된 일
- TODO 완료 처리
- 완료 이력 기록
- Supabase Row Level Security를 이용한 Space 단위 권한 제어
- Expo Go에서 실행 가능한 개발 환경 구성

## 5. MVP 이후 후보 기능

- 담당자 지정
- 집안일 난이도 또는 예상 소요 시간
- 구성원별 완료 통계
- 푸시 알림
- 캘린더 뷰
- TODO 템플릿
- 완료 취소
- 스킵 처리
- 초대 링크
- 이메일 초대
- 반복 규칙 고도화
  - 연간 반복
  - 커스텀 반복
  - 특정 요일
  - 매월 특정 날짜
  - 마지막 완료일 기준 반복
  - 고정 스케줄 기준 반복
- 오프라인 상태에서 임시 저장 후 동기화
- Space별 역할과 세분화된 권한

## 6. 핵심 개념

### 6.1 User

Supabase Auth의 사용자다.
앱에서는 `profile` 테이블로 닉네임, 아바타 같은 앱 전용 정보를 확장할 수 있다.

### 6.2 Todo Space

여러 사용자가 공유하는 집안일 TODO 공간이다.
예: `우리집`, `자취방`, `본가`, `신혼집`

### 6.3 Space Member

사용자와 Todo Space의 관계다.
한 사용자는 여러 Space에 속할 수 있고, 한 Space에는 여러 사용자가 참여할 수 있다.

### 6.4 Chore

반복 가능한 집안일 항목이다.
예: `화장실 청소`, `분리수거`, `침구 세탁`

### 6.5 Occurrence

특정 기간에 해야 하는 실제 TODO 인스턴스다.
MVP에서는 Occurrence를 DB 테이블로 저장하지 않고, 프론트엔드에서 `chores`의 반복 규칙과 `chore_completions`의 완료 기록을 조합해 계산한다.

예를 들어 `화장실 청소`라는 Chore가 매주 1회 반복된다면, `2026년 24주차 화장실 청소`는 하나의 Occurrence가 된다.
그 주 안에서는 월요일에 해도 되고, 일요일에 해도 된다.

이 Occurrence는 화면에 보여주기 위한 계산 결과이며, 완료 시에는 `chore_completions`에 해당 기간의 시작일을 기록한다.

### 6.6 Completion

누가, 언제, 어떤 TODO를 완료했는지 남기는 기록이다.

## 7. 데이터 모델 초안

아래는 Supabase/PostgreSQL 기준의 초안이며, 구현하면서 조정한다.

### 7.1 profiles

- `id`: Supabase Auth user id
- `display_name`
- `avatar_url`
- `created_at`
- `updated_at`

### 7.2 spaces

- `id`
- `name`
- `created_by`
- `created_at`
- `updated_at`

### 7.3 space_members

- `id`
- `space_id`
- `user_id`
- `role`: `owner`, `admin`, `member`
- `joined_at`

### 7.4 space_invites

- `id`
- `space_id`
- `code`
- `created_by`
- `expires_at`
- `max_uses`
- `used_count`
- `created_at`

### 7.5 chores

- `id`
- `space_id`
- `title`
- `description`
- `recurrence_type`: `daily`, `weekly`, `monthly`, `interval_days`
- `recurrence_value`: 반복 타입에 따른 값
- `start_date`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

`recurrence_value` 초안:

- `daily`: 사용하지 않음. 하루에 1회
- `weekly`: 사용하지 않음. ISO 8601 기준 한 주에 1회
- `monthly`: 사용하지 않음. 한 달에 1회
- `interval_days`: 반복 간격 일수. 예: `3`이면 시작일 기준 3일마다 반복

MVP의 `daily`, `weekly`, `monthly`는 특정 요일이나 특정 날짜에 고정되지 않는다.
핵심은 해당 기간 안에 1회 완료하면 된다는 점이다.
`weekly`의 주간 계산은 ISO 8601 기준을 따른다.

### 7.6 chore_completions

- `id`
- `chore_id`
- `space_id`
- `completed_by`
- `target_period_start`
- `completed_at`
- `note`

`chore_completions`는 현재 완료 상태를 나타낸다.
해당 기간의 완료 row가 있으면 완료, 없으면 미완료로 판단한다.
완료 취소는 row를 삭제하는 방식으로 처리한다.

### 7.7 chore_completion_events

- `id`
- `chore_id`
- `space_id`
- `target_period_start`
- `event_type`: `completed`, `uncompleted`
- `actor_id`
- `created_at`

`chore_completion_events`는 완료/완료 취소 이력을 남기는 로그 테이블이다.
예를 들어 A가 완료하고, B가 완료 취소하고, 다시 B가 완료하면 아래처럼 이벤트가 남는다.

```text
A completed
B uncompleted
B completed
```

현재 완료 여부는 `chore_completions`로 빠르게 판단하고, 누가 언제 완료/취소했는지의 이력은 `chore_completion_events`로 확인한다.
로그 테이블은 수정/삭제를 허용하지 않는 방향으로 설계한다.

## 8. 권한 모델 초안

Supabase RLS는 Space 멤버십을 기준으로 설계한다.

- Space 멤버만 해당 Space의 데이터를 읽을 수 있다.
- Space 멤버만 해당 Space의 TODO를 완료할 수 있다.
- Space 멤버는 `owner`, `admin`, `member` 중 하나의 역할을 가진다.
- `owner`는 Space 생성자이며 초대 코드를 만들 수 있다.
- `admin`은 Space 관리자로 초대 코드를 만들 수 있다.
- `member`는 일반 멤버이며 TODO 조회, 생성, 수정, 삭제, 완료에 참여할 수 있지만 초대 코드는 만들 수 없다.
- MVP에서는 TODO 생성, 수정, 삭제, 완료 권한은 모든 Space 멤버에게 허용한다.
- Space 멤버는 완료 기록을 생성하거나 삭제하여 완료/완료 취소를 처리할 수 있다.
- 완료/완료 취소 이벤트 로그는 Space 멤버가 조회할 수 있고, actor가 본인인 이벤트만 생성할 수 있다.
- 역할 관리는 MVP 범위에 포함하지 않는다. 즉 앱에서 멤버의 역할을 변경하는 화면은 만들지 않는다.

RLS 적용 방향:

- `profiles`: 사용자는 자기 profile을 조회, 생성, 수정할 수 있다.
- `spaces`: Space 멤버는 Space를 조회/수정할 수 있다. Space 생성은 `create_space` RPC로 처리하며 생성자는 `owner`가 된다.
- `space_members`: Space 멤버는 같은 Space의 멤버십 row를 조회할 수 있다. 멤버 직접 추가는 열지 않고 초대 코드 참여 RPC로 처리한다.
- `space_invites`: 초대 코드는 bearer secret에 가깝기 때문에 `owner` 또는 `admin`만 조회/생성할 수 있다. 초대 코드 생성은 `create_invite_code` RPC, 초대 코드 참여는 `join_space_with_invite_code` RPC로 처리한다.
- `chores`: Space 멤버는 해당 Space의 Chore를 조회, 생성, 수정, 삭제할 수 있다.
- `chore_completions`: Space 멤버는 완료 상태를 조회, 생성, 삭제할 수 있다. 수정은 허용하지 않는다.
- `chore_completion_events`: Space 멤버는 이벤트 로그를 조회할 수 있고, 본인이 actor인 이벤트만 생성할 수 있다. 수정/삭제는 허용하지 않는다.

## 9. 화면 구성 초안

### 9.1 인증 화면

- 이메일/비밀번호 로그인
- 사전 생성된 테스트 계정 안내
- 로그아웃

### 9.2 Space 선택 화면

- 내가 속한 Space 목록
- 새 Space 만들기
- 초대 코드로 Space 참여

### 9.3 오늘 화면

- 오늘 해야 할 집안일 목록
- 완료 버튼
- 담당자 또는 완료자 표시
- 반복 섹션별 현재 기간 표시

### 9.4 TODO 관리 흐름

- 오늘 화면에서 TODO 생성 진입
- 오늘 화면의 TODO 메뉴에서 수정/비활성화 진입
- TODO 수정 화면에서 등록자와 등록일 표시
- 별도 전체 TODO 탭이나 관리 화면은 MVP에서 제외

### 9.5 이력 화면

- 날짜별 완료 이력
- 완료한 사람 표시
- 개별 TODO 이력에서 반복 기간 표시
- 설정 화면의 관리 메뉴에서 전체 이력으로 진입
- 오늘 화면의 TODO 메뉴에서 개별 TODO 이력으로 진입

### 9.6 Space 설정 화면

- Space 이름
- 멤버 목록
- 초대 코드 생성
- 초대 코드 관리
- 완료 이력 진입

### 9.7 Figma 화면 설계 기준

MVP UI는 Apple Human Interface Guidelines를 참고한 미니멀한 모바일 UI를 지향한다.
라이트 모드와 다크 모드를 모두 고려하고, 버튼, 입력, 리스트 아이템 같은 공통 요소는 컴포넌트로 분리해 설계한다.

Figma에서는 아래 프레임을 기준으로 먼저 그린다.

- 로그인
- Space 대시보드
- Space 선택 모달
- Space 생성
- 초대 코드 표시 또는 입력
- TODO 생성/수정
- 완료 이력
- Space 설정

공통 레이아웃:

- 상단 헤더: 현재 Space 선택 진입
- 본문 영역: Space 대시보드, 목록, 빈 상태, 로딩 상태, 에러 상태
- 우측 하단 플로팅 버튼: TODO 생성 진입
- 하단 고정 버튼 영역: 생성/수정/취소처럼 현재 화면의 주요 액션
- 기본 내비게이션: MVP에서는 하단 탭을 사용하지 않고 홈 화면의 공통 헤더를 중심으로 둔다. 헤더에는 현재 Space 선택 진입과 설정 진입을 배치한다. 완료 이력은 설정의 관리 메뉴에서 진입하는 보조 화면으로 둔다.

공통 컴포넌트:

- `TextInput`: 이메일, 비밀번호, Space 이름, 초대 코드, TODO 제목 입력
- `PrimaryButton`: 로그인, 생성, 저장, 완료 같은 주요 액션
- `SecondaryButton`: 취소, 로그아웃, 초대 코드 재생성 같은 보조 액션
- `IconButton`: 메뉴 열기, 닫기 같은 아이콘 액션
- `FloatingActionButton`: TODO 생성 화면으로 이동하는 우측 하단 플러스 버튼
- `AppHeader`: Space 선택 버튼, Space 이름, 설정 버튼을 포함하는 상단 헤더
- `SpacePickerModal`: 참여 중인 Space 목록을 보여주고 Space를 전환하는 모달
- `PeriodSection`: `매일`, `매주`, `매월`, `N일마다` 같은 주기별 TODO 컨테이너
- `ChoreListItem`: 집안일 제목, 반복 주기, 현재 기간 완료 여부, 완료 버튼
- `CompletionListItem`: 완료된 집안일 제목, 완료자, 완료 시간
- `SpaceListItem`: Space 이름, 멤버 수
- `DropdownMenu`: TODO 수정, 삭제 같은 보조 액션 메뉴
- `EmptyState`: 목록이 비어 있을 때 보여주는 간단한 안내와 액션
- `ErrorState`: 실패 메시지와 다시 시도 버튼

헤더:

- 좌측: Space 선택 버튼과 현재 Space 이름을 표시한다.
- Space 선택 버튼은 아래 방향 화살표 또는 chevron 아이콘을 사용한다.
- 좌측 영역을 누르면 Space 선택 모달을 연다.
- Space 생성은 Space 선택 화면의 보조 액션으로 제공한다.
- 신규 사용자는 기본 Space가 자동 생성되므로 현재 Space가 없는 상태는 로딩/오류 또는 예외 상태로만 다룬다.

우측 하단 플로팅 버튼:

- 플러스 아이콘을 사용한다.
- 누르면 TODO 생성 화면으로 이동한다.
- 로그인 전, Space 미선택 상태, 로딩 상태에서는 비활성화하거나 숨긴다.

Space 생성 화면:

- Space 이름 입력 필드
- 하단 생성 버튼
- 하단 취소 버튼
- 생성 성공 시 새 Space를 현재 Space로 선택한다.
- 입력값이 비어 있으면 생성 버튼을 비활성화한다.

TODO 생성/수정 화면:

- 제목 입력 필드
- 주기 설정 컨트롤
- 하단 생성 또는 저장 버튼
- 하단 취소 버튼
- 수정 모드에서는 삭제 버튼을 함께 제공한다.
- MVP의 실제 반복 타입은 `매일`, `매주`, `매월`, `N일마다`를 우선한다.
- Figma에서는 `연간`, `커스텀` 옵션을 확장 후보로 표시할 수 있지만, 구현 범위에 포함하려면 데이터 모델과 커리큘럼을 함께 수정한다.

Space 대시보드:

- 현재 Space 기준의 집안일 현황을 보여주는 메인 화면이다.
- 주기 컨테이너 컴포넌트를 나열한다.
- Space 초대 버튼을 제공한다.
- 초대 버튼을 누르면 일정 시간 유효한 초대 코드를 표시한다.
- 할 일이 없는 경우 빈 상태를 표시하고 TODO 생성 액션을 제공한다.

주기 컨테이너 컴포넌트:

- `매일`, `매주`, `매월`, `N일마다` 같은 주기 키워드를 표시한다.
- 주기별로 배경색, 테두리색, 라벨 색상 중 하나를 다르게 줄 수 있다.
- 내부에 해당 주기의 TODO 아이템 리스트를 렌더링한다.
- 전체 개수와 완료 개수를 함께 표시할 수 있다.
- 모든 TODO가 완료된 경우 완료 상태를 시각적으로 구분한다.

TODO 아이템 컴포넌트:

- 완료 표시를 위한 체크박스를 제공한다.
- TODO 제목 텍스트를 표시한다.
- 우측에 `...` 메뉴 아이콘 버튼을 제공한다.
- 메뉴에는 수정, 삭제를 포함한다.
- 스킵은 MVP 이후 후보 기능으로 두며, Figma에서는 선택적으로 시안에 표시할 수 있다.
- 완료 상태에서는 체크박스가 선택되고 텍스트 또는 배경이 완료 상태로 바뀐다.
- 스킵 상태를 도입한다면 완료와 다른 시각 상태가 필요하며, 데이터 모델에 스킵 기록 방식이 추가되어야 한다.

화면별 필수 요소:

- 로그인: 이메일 입력, 비밀번호 입력, 로그인 버튼, 테스트 계정 안내
- Space 대시보드: 헤더, 주기 컨테이너 목록, 초대 코드 표시 액션, TODO 생성 플로팅 버튼
- Space 선택 모달: 내가 속한 Space 목록, 현재 Space 표시, 초대 코드 입력 액션
- Space 생성: Space 이름 입력, 생성 버튼, 취소 버튼
- TODO 생성/수정: 제목 입력, 반복 타입 선택, 반복 값 입력, 등록자/등록일 표시, 저장 버튼, 삭제 버튼
- 완료 이력: 날짜 또는 기간별 완료 목록, 완료자 표시
- Space 설정: Space 이름, 멤버 목록, 완료 이력 진입, 초대 코드 생성/복사, 로그아웃
- 초대 코드 입력: 코드 입력, 참여 버튼, 성공/실패 상태

라이트/다크 모드:

- 배경, 텍스트, 구분선, 입력 필드, 버튼, 완료 상태 색상을 라이트/다크 모드별로 정의한다.
- 의미 색상은 과하게 늘리지 않는다.
- 주기 구분 색상은 라이트/다크 모드 양쪽에서 대비가 충분해야 한다.

## 10. 기술 스택 초안

### 10.1 앱

- React Native
- Expo
- Expo Go
- TypeScript
- Expo Router
- React Query 또는 TanStack Query
- Zustand 또는 React Context

### 10.2 백엔드

- Supabase Auth
- Supabase Database
- Supabase Realtime
- Supabase Row Level Security
- Supabase Edge Functions는 필요할 때만 도입

### 10.3 모노레포

초기 후보 구조:

```text
homeTodo/
  apps/
    mobile/
  packages/
    shared/
    supabase/
  docs/
```

후보 도구:

- pnpm workspace
- Turborepo
- TypeScript project references는 필요해질 때 검토

## 11. Expo Go 제약 고려

Expo Go를 사용할 것이므로 네이티브 모듈 추가가 필요한 기능은 신중히 선택한다.

- Expo Go에서 바로 가능한 기능을 우선한다.
- 공식 App Store/Play Store의 Expo Go와 호환되는 SDK를 사용한다.
- 2026-06-06 기준 SDK 56용 Expo Go가 스토어에 제공되지 않아, MVP는 SDK 54로 시작한다.
- 커스텀 네이티브 코드가 필요한 라이브러리는 MVP에서 피한다.
- 푸시 알림, 딥링크, 백그라운드 작업은 구현 전에 Expo Go 호환성을 확인한다.

## 12. 주요 결정 필요 사항

현재 MVP의 주요 방향은 1차로 결정되었다.
구현 중 새 의사결정이 생기면 이 섹션에 추가한다.

## 13. 결정된 사항

### 13.1 MVP 로그인 방식

MVP에서는 회원가입, Magic Link, OAuth를 구현하지 않는다.
Supabase Auth에 미리 생성해 둔 계정을 사용자가 앱에 직접 입력하여 로그인한다.

이렇게 시작하는 이유는 Expo Go 환경에서 Magic Link 딥링크 설정 이슈를 피하고, 초반 학습 초점을 Supabase 연결, 세션 관리, Space 권한 모델, RLS에 두기 위해서다.

### 13.2 반복 TODO 계산 방식

MVP에서는 반복 TODO의 Occurrence를 DB에 미리 생성하지 않는다.
DB에는 `chores`에 반복 규칙만 저장하고, 프론트엔드에서 기간별 Occurrence를 계산해 화면에 보여준다.

완료 여부는 `chore_completions`의 `target_period_start`와 `chore_id`를 기준으로 판단한다.
MVP의 반복 기준은 "특정 날짜에 해야 함"이 아니라 "해당 기간 안에 1회 완료하면 됨"이다.
예를 들어 `weekly` 집안일은 ISO 8601 기준 한 주 안에 언제든 한 번 완료하면 된다.

반복 계산 구현 단계에서는 JavaScript `Date`를 직접 다루기보다 `date-fns` 도입을 우선 검토한다.
특히 로컬 날짜 기준 `YYYY-MM-DD` 생성, ISO 주 시작일, 월 시작일, `interval_days` 기준 기간 계산을 명시적인 유틸 함수로 분리한다.

### 13.3 MVP 초대 방식

MVP에서는 초대 코드 방식을 사용한다.
Space의 `owner` 또는 `admin`이 초대 코드를 만들고, 다른 사용자는 앱에서 해당 코드를 직접 입력해 Space에 참여한다.

초대 링크와 이메일 초대는 MVP 이후 후보 기능으로 둔다.
Expo Go 환경에서 딥링크와 메일 발송 같은 부가 설정을 피하고, Supabase 테이블과 RLS 학습에 집중하기 위해서다.

초대 흐름:

1. 기존 Space의 `owner` 또는 `admin`이 Space 설정에서 초대 코드를 생성한다.
2. 코드를 다른 사용자에게 직접 전달한다.
3. 다른 사용자가 사전 생성된 계정으로 로그인한다.
4. Space 선택 화면에서 초대 코드를 입력한다.
5. 앱이 유효한 코드인지 확인한다.
6. 유효하면 `space_members`에 사용자를 `member` 역할로 추가한다.

초대 코드는 MVP에서 별도 비밀번호를 요구하지 않는다.
대신 8자리 이상의 대문자/숫자 랜덤 코드, 짧은 만료 시간, 사용 횟수 제한, 전역 unique 제약을 사용한다.
랜덤 대입 공격 방지는 추후 Edge Function 또는 서버 로직에서 rate limit으로 보완한다.
실패 메시지는 구체적인 원인을 노출하지 않고 "유효하지 않거나 만료된 코드예요"처럼 표시한다.

### 13.4 MVP 권한 모델

MVP에서는 `owner`, `admin`, `member` 역할을 사용한다.
이 역할은 주로 초대 코드 생성 권한을 제한하기 위한 최소 권한 모델이다.

- `owner`: Space 생성자. 초대 코드를 만들 수 있다.
- `admin`: Space 관리자. 초대 코드를 만들 수 있다.
- `member`: 일반 멤버. 초대 코드는 만들 수 없지만 TODO 생성, 수정, 삭제, 완료는 할 수 있다.

MVP에서는 역할 변경 UI를 만들지 않는다.
상용 앱이라면 멤버 초대, 강퇴, 역할 변경, 소유권 이전 같은 기능이 필요할 수 있지만, 이 프로젝트에서는 초대 코드 보안을 위한 최소 역할 구분까지만 다룬다.

### 13.5 기본 Space 생성

사용자가 처음 생성되면 `profiles` row와 함께 기본 Space를 자동 생성하고, 해당 사용자를 `space_members`에 추가한다.
이미 존재하는 사용자 중 Space가 하나도 없는 사용자는 migration으로 기본 Space를 한 번 생성한다.
이렇게 하면 첫 로그인 직후에도 홈 화면이 빈 Space 선택 상태로 시작하지 않고, 바로 TODO 생성 흐름으로 이어질 수 있다.

### 13.6 알림 기능

알림 기능은 MVP에 포함하지 않는다.
푸시 알림은 Expo Go 제약, 권한 요청, 플랫폼별 동작 차이 때문에 초기 학습 범위를 넓힐 수 있다.

MVP에서는 사용자가 앱을 열었을 때 현재 기간에 해야 할 집안일과 완료 여부를 명확히 보여주는 데 집중한다.
푸시 알림은 MVP 이후 후보 기능으로 둔다.

### 13.7 MVP UI 방향

UI는 단순하게 구성한다.
다만 Figma로 화면을 그릴 수 있도록 화면 목적, 주요 영역, 공통 컴포넌트는 기획서에 명확히 정의한다.

MVP UI의 목표:

- 학습과 구현이 쉬운 구조
- iOS/Android에서 모두 자연스러운 기본 모바일 UI
- Space, Chore, Completion의 관계가 화면에서 이해되는 구성
- 화려한 시각 효과보다 반복 TODO 상태를 빠르게 확인하는 사용성
- 이후 디자인을 입히기 쉬운 명확한 컴포넌트 단위

현재 앱에 구현된 Phase 5 화면은 React Native와 Expo 화면 구조를 익히기 위한 임시 디자인이다.
최종 UI 스타일은 추후 Figma에서 다시 정리하고, 그 결과를 바탕으로 색상, 간격, 타이포그래피, radius, 버튼 스타일 등의 디자인 시스템과 스타일 토큰을 적용한다.

## 14. 1차 학습 로드맵

세부 체크리스트와 진행 순서는 `docs/homeTodo-curriculum.md`를 기준으로 한다.
기획이나 화면 흐름이 바뀌면 이 문서와 커리큘럼 문서를 함께 수정한다.

1. 모노레포와 Expo 앱 생성
2. Expo Go에서 기본 앱 실행
3. Supabase 프로젝트 생성
4. Supabase Auth에 테스트 계정 생성
5. 이메일/비밀번호 로그인 연결
6. Space 테이블과 RLS 작성
7. 모바일 앱에서 Space 목록 조회
8. TODO 생성/조회/완료 구현
9. 반복 규칙 계산 구현
10. 공유 Space 초대 구현
11. Realtime 또는 Query Invalidation으로 동기화 경험 개선

## 15. 현재 기획 상태

이 문서는 초안이다.
구현을 시작하기 전에 MVP의 범위를 지나치게 키우지 않도록 계속 업데이트한다.
