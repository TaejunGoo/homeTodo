# homeTodo

homeTodo는 React Native, Expo, Supabase를 익히기 위해 만든 iOS/Android 공용 반복 할 일 앱입니다.
여러 사용자가 하나의 Space를 공유하고, 매일·매주·매월·N일마다 반복되는 할 일을 함께 완료할 수 있습니다.

앱스토어 배포 대신 Expo Go에서 사용하는 학습용 MVP로 개발했으며, 현재는 핵심 흐름 구현을 마치고 프로젝트를 종료한 상태입니다. 프로덕션 서비스로 사용하기 위한 완성도와 보안 검증까지 마친 앱은 아닙니다.

## 핵심 설계

- 반복 할 일의 개별 발생분(Occurrence)을 DB에 미리 만들지 않습니다.
- 앱이 `chores`의 반복 규칙과 `chore_completions`를 조합해 현재 기간의 상태를 계산합니다.
- 매주는 ISO 8601 주간, 매월은 달력 월, N일마다는 시작일 기준 구간으로 계산합니다.
- Space 단위 데이터 접근은 Supabase Row Level Security(RLS)로 제한합니다.
- Space 생성, 초대 코드 생성, 초대 참여처럼 여러 데이터가 함께 바뀌는 작업은 PostgreSQL RPC로 처리합니다.

## 구현된 기능

### 계정과 Space

- 사전 생성된 Supabase 계정의 이메일/비밀번호 로그인
- 로그인 세션 저장 및 자동 갱신, 로그아웃
- 프로필 표시 이름 조회 및 수정
- 신규 사용자의 기본 Space 자동 생성
- Space 생성, 목록 조회, 선택
- Space 멤버 목록 조회
- 만료 시간이 있는 초대 코드 생성 및 코드로 참여
- `owner`, `admin`, `member` 역할 저장
- `owner`와 `admin`만 초대 코드를 조회·생성하도록 제한
- 모든 Space 멤버의 할 일 생성·수정·삭제·완료 허용

### 반복 할 일

- 할 일 생성, 조회, 수정, 비활성화 방식의 삭제
- 매일, 매주, 매월, N일마다 반복
- N일마다의 값이 `1`이면 매일 반복으로 정규화
- 반복 주기별 홈 화면 섹션 구성
- 서로 다른 N일 간격을 `3일마다`, `14일마다`처럼 별도 섹션으로 표시
- 현재 기간의 완료 여부와 최근 3개 기간의 완료 상태 표시

### 완료와 이력

- 현재 기간 완료 및 완료 취소
- 중복 완료 방지
- 낙관적 UI 업데이트와 실패 시 원상 복구
- 완료자와 완료 시각 표시
- Space 전체 완료/완료 취소 이력 조회 및 페이지 단위 더 보기
- 개별 할 일의 완료 이력 조회

### 앱 UI

- Expo Router 기반 파일 라우팅
- 홈, 로그인, Space 선택·생성·참여, 할 일 생성·수정, 설정, 전체/개별 이력 화면
- 공통 로딩, 빈 상태, 에러, 확인 모달, 액션 바텀시트, 토스트
- Safe Area와 키보드 회피 처리
- Expo Go에서 실행 가능한 Expo SDK 54 구성

## 구현하지 않았거나 마무리하지 않은 기능

- 회원가입, 비밀번호 재설정, 매직 링크, OAuth
- 푸시 알림과 앱 내 리마인더
- 담당자 지정, 난이도, 통계, 캘린더, 할 일 템플릿
- 특정 요일·특정 날짜·연간 반복 및 스킵
- Space 이름 변경·삭제, 탈퇴, 멤버 내보내기, 역할 변경 UI
- Supabase Realtime 기반의 화면 즉시 동기화
- 오프라인 저장과 재연결 동기화
- 전체 화면의 완전한 다크 모드와 확정된 디자인 시스템
- 세션 만료 전용 안내와 복구 UX
- 초대 코드 시도 횟수 제한 및 IP 기반 rate limit
- 단위 테스트, E2E 테스트, RLS 접근 제어 자동 테스트
- 앱스토어/플레이스토어 배포 및 프로덕션 운영 환경

## 기술 스택

- React Native 0.81
- React 19
- Expo SDK 54 / Expo Go
- Expo Router 6
- TypeScript 5.9
- Supabase Auth, PostgreSQL, RLS, RPC
- pnpm workspace

## 저장소 구조

```text
homeTodo/
  apps/
    mobile/                 # Expo 모바일 앱
  packages/
    supabase/
      migrations/          # 스키마, RLS, RPC 마이그레이션
  docs/                     # 기획, 학습 기록, 보안 및 UI 문서
  package.json
  pnpm-workspace.yaml
```

## 로컬 실행

### 준비물

- Node.js 24 (개발 시 24.16 사용)
- pnpm 11.5.2
- iOS 또는 Android 기기의 Expo Go
- Supabase 프로젝트와 이메일/비밀번호 테스트 계정

### 설치 및 환경 변수

저장소 루트에서 의존성을 설치합니다.

```bash
pnpm install
```

`apps/mobile/.env`를 만들고 Supabase 프로젝트 값을 입력합니다.

```dotenv
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

DB 스키마는 [`packages/supabase/migrations`](packages/supabase/migrations)의 SQL을 순서대로 적용합니다. 기존 원격 프로젝트는 Supabase Dashboard에서 먼저 변경한 이력이 있으므로, CLI의 `db push`를 사용하기 전 [`packages/supabase/README.md`](packages/supabase/README.md)의 주의사항을 확인해야 합니다.

### 실행

```bash
pnpm start
```

터미널에 표시되는 QR 코드를 Expo Go로 스캔합니다. 개발 PC와 모바일 기기가 같은 네트워크에 있어야 합니다.

### 정적 검사

```bash
pnpm lint
pnpm --filter mobile exec tsc --noEmit
```

자동화된 테스트는 추가하지 않았습니다.

## 문서

- [`docs/homeTodo-planning.md`](docs/homeTodo-planning.md): 기획, 데이터 모델, 화면 및 정책 결정
- [`docs/homeTodo-curriculum.md`](docs/homeTodo-curriculum.md): 단계별 학습·구현 기록과 최종 상태
- [`docs/react-native-expo-notes.md`](docs/react-native-expo-notes.md): React Native와 Expo 학습 노트
- [`docs/db-security-notes.md`](docs/db-security-notes.md): Supabase DB와 RLS 보안 노트
- [`docs/figma-ai-prompt.md`](docs/figma-ai-prompt.md): 화면 설계를 위해 작성한 Figma AI 프롬프트

## 최종 상태

공유 Space에서 반복 할 일을 만들고, 여러 사용자가 완료 상태와 이력을 함께 관리하는 핵심 학습 목표는 달성했습니다. 위의 미구현 항목은 프로젝트 종료 시점의 후속 개선 후보로 남겨 둡니다.
