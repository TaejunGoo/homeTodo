# homeTodo 실습 커리큘럼

## 1. 문서 목적

이 문서는 homeTodo MVP를 만들기 위한 단계별 체크리스트다.
Codex가 직접 구현하기보다 사용자가 React Native, Expo, Supabase, 모노레포, Figma 디자인 작업을 직접 경험하도록 안내하는 기준으로 사용한다.

관련 문서:

- `docs/homeTodo-planning.md`: 앱 기획, MVP 범위, 데이터 모델, 화면 정의
- `docs/collaboration-principles.md`: Codex와 사용자의 협업 방식
- `docs/homeTodo-curriculum.md`: 실제 진행 순서와 단계별 체크리스트

## 2. 문서 동기화 원칙

기획, 디자인, 구현 계획은 서로 분리되어 있지만 항상 함께 갱신한다.

- MVP 범위가 바뀌면 `homeTodo-planning.md`와 이 문서를 함께 수정한다.
- 화면이나 UI 흐름이 바뀌면 `homeTodo-planning.md`의 화면 정의와 이 문서의 Figma 단계를 함께 수정한다.
- 진행 방식이 바뀌면 `collaboration-principles.md`와 이 문서를 함께 수정한다.
- 데이터 모델이나 RLS 정책이 바뀌면 `homeTodo-planning.md`의 데이터 모델과 이 문서의 Supabase 단계를 함께 수정한다.
- 각 단계가 끝나면 완료 여부, 배운 점, 다음 단계 영향을 필요하면 이 문서에 반영한다.

## 3. 진행 방식

각 단계는 아래 순서로 진행한다.

1. 목표 확인
2. 사용자가 직접 실행
3. 결과 또는 에러 공유
4. Codex가 결과 해석
5. 필요한 문서 업데이트
6. 다음 단계로 이동

체크박스 상태:

- `[ ]`: 아직 시작하지 않음
- `[~]`: 진행 중
- `[x]`: 완료

사용자는 React, Next.js, JavaScript 기반 UI 구현 경험이 있으므로 React 기본 문법, 배열 렌더링, 컴포넌트 기초 설명은 생략하거나 짧게 다룬다.
실습 설명은 React Native와 Expo에서 달라지는 지점에 집중한다. 특히 네이티브 컴포넌트, `StyleSheet`, 모바일 레이아웃, Safe Area, 터치 인터랙션, Expo Router, Expo Go 제약, 플랫폼별 차이, Supabase 연동 흐름을 우선 다룬다.

## 4. 전체 단계

### Phase 0. 기획 고정과 작업 준비

목표: MVP의 방향을 확인하고, 작업을 시작할 기준 문서를 정리한다.

- [x] 앱 목표 정의
- [x] MVP 로그인 방식 결정
- [x] 반복 TODO 계산 방식 결정
- [x] 초대 방식 결정
- [x] Space 권한 모델 결정
- [x] 알림 제외 결정
- [x] Figma 작업을 위한 UI 정의 추가
- [x] 현재 문서 3종을 읽고 서로 충돌하는 내용 확인
- [x] Git 저장소 초기화 여부 결정
- [x] GitHub 원격 저장소 연결 확인

산출물:

- `docs/homeTodo-planning.md`
- `docs/collaboration-principles.md`
- `docs/homeTodo-curriculum.md`

### Phase 1. Figma 와이어프레임

목표: 구현 전에 MVP 화면 흐름과 주요 UI 요소를 확인한다.
정교한 Figma 파일 완성은 목표로 하지 않고, Figma AI 결과와 `docs/figma-ai-prompt.md`를 화면 정의 참고 자료로 사용한다.

- [x] Figma 파일 생성
- [x] `docs/figma-ai-prompt.md`를 참고해 Figma AI 초안 생성
- [~] 모바일 기준 프레임 크기 선택
- [x] 공통 레이아웃 정의
  - 상단 제목 영역
  - 본문 목록 영역
  - 공통 헤더 또는 주요 버튼 영역
- [x] Apple HIG를 참고한 미니멀 UI 방향 정의
- [~] 라이트/다크 모드 색상 기준 초안 작성
- [x] 공통 컴포넌트 초안 작성
  - Header
  - TextInput
  - PrimaryButton
  - SecondaryButton
  - IconButton
  - FloatingActionButton
  - PeriodSection
  - ChoreListItem
- [x] 로그인 화면 구조 정의
- [x] Space 대시보드 화면 구조 정의
- [x] Space 선택 모달 구조 정의
- [x] Space 생성 화면 구조 정의
- [x] 초대 코드 표시 또는 입력 UI 구조 정의
- [x] TODO 관리 흐름 구조 정의
- [x] TODO 생성/수정 화면 구조 정의
- [x] 완료 이력 화면 구조 정의
- [x] Space 설정 화면 구조 정의
- [x] TODO 아이템의 기본/완료/스킵 후보 상태 정의
- [~] 빈 상태, 로딩 상태, 에러 상태를 최소 1개씩 정의
- [x] `docs/homeTodo-planning.md`의 `9.7 Figma 화면 설계 기준`과 비교
- [ ] 화면 흐름 변경 사항이 있으면 기획서와 이 문서 함께 수정

산출물:

- Figma AI 결과물
- `docs/figma-ai-prompt.md`
- 화면 목록과 컴포넌트 목록의 기획서 반영

### Phase 2. 로컬 개발 환경 확인

목표: Expo 앱을 만들기 전에 로컬 도구 상태를 확인한다.

- [x] Node.js 버전 확인
- [x] pnpm 설치 여부 확인
- [x] Expo 계정 또는 Expo Go 사용 준비
- [x] iOS 또는 Android 실기기에서 Expo Go 설치 확인
- [x] 작업 폴더 구조 확인
- [x] Git 저장소 초기화
- [x] `.gitignore` 준비

확인 기준:

- 터미널에서 Node.js와 pnpm 명령이 동작한다.
- Expo Go를 실행할 기기가 준비되어 있다.
- 레포 루트가 명확하다.

### Phase 3. 모노레포 초기화

목표: 앱과 공용 패키지를 나눌 수 있는 기본 모노레포 구조를 만든다.

- [x] `pnpm-workspace.yaml` 생성
- [x] 루트 `package.json` 생성
- [x] `apps/` 디렉터리 생성
- [x] `packages/` 디렉터리 생성
- [x] `docs/` 유지
- [x] 루트 명령어 전략 결정
- [x] 생성된 구조를 기획서의 모노레포 구조와 비교
- [x] 구조 변경이 있으면 기획서와 이 문서 함께 수정

목표 구조:

```text
homeTodo/
  apps/
    mobile/
  packages/
    shared/
    supabase/
  docs/
```

### Phase 4. Expo 모바일 앱 생성

목표: Expo Go에서 실행되는 최소 React Native 앱을 만든다.

- [x] `apps/mobile`에 Expo 앱 생성
- [x] TypeScript 템플릿 확인
- [x] Expo Router 사용 여부 확인
- [x] Expo Go 호환을 위해 SDK 54 선택
- [x] 개발 서버 실행
- [x] Expo Go로 앱 열기
- [x] 첫 화면 텍스트 수정 후 반영 확인
- [x] iOS/Android 중 가능한 환경에서 실행 확인

확인 기준:

- Expo Go에서 앱이 열린다.
- 코드 수정 후 화면이 갱신된다.

### Phase 5. Figma 기반 화면 껍데기 구현

목표: 데이터 연결 전에 Figma 와이어프레임을 기준으로 화면 구조를 만든다.

- [x] Expo Router와 React Native 프로젝트 구조 확인
- [x] 로그인 화면 컴포넌트 작성
- [x] Space 선택 화면 작성
- [x] 초대 코드 입력 화면 작성
- [x] 오늘 화면 작성
- [x] TODO 관리 흐름 작성
- [x] TODO 생성/수정 화면 작성
- [x] 완료 이력 화면 작성
- [x] Space 설정 화면 작성
- [x] 공통 헤더 기반 기본 내비게이션 구성
- [x] 빈 상태, 로딩 상태, 에러 상태 UI 작성
- [x] Figma와 실제 앱 화면 차이를 기록
- [x] 차이가 기획 변경이면 기획서와 이 문서 함께 수정

확인 기준:

- 아직 Supabase 연결이 없어도 모든 MVP 화면으로 이동할 수 있다.
- 화면 이름과 주요 요소가 Figma와 크게 어긋나지 않는다.

현재 Phase 5 화면은 React Native와 Expo 화면 구조 학습을 위한 임시 디자인이다.
추후 Figma에서 화면을 다시 정리한 뒤 색상, 간격, 타이포그래피, radius, 버튼 스타일을 포함한 디자인 시스템과 스타일 토큰을 적용한다.

### Phase 6. Supabase 프로젝트와 Auth

목표: Supabase 프로젝트를 만들고 사전 생성 계정 로그인을 연결한다.

- [x] Supabase 프로젝트 생성
- [x] 프로젝트 URL 확인
- [x] anon key 확인
- [x] Supabase Auth 설정 확인
- [~] 테스트 계정 2개 이상 생성
- [x] 앱 환경 변수 연결 방식 결정
- [x] Supabase 클라이언트 생성
- [x] 이메일/비밀번호 로그인 구현
- [x] 로그아웃 구현
- [x] 세션 유지 확인

확인 기준:

- 사전 생성 계정으로 로그인할 수 있다.
- 앱 재실행 후 세션 상태를 확인할 수 있다.

### Phase 7. Database 기본 테이블

목표: Space 공유와 TODO 관리를 위한 기본 테이블을 만든다.

- [x] `profiles` 테이블 생성
- [x] `spaces` 테이블 생성
- [x] `space_members` 테이블 생성
- [x] `space_invites` 테이블 생성
- [x] `chores` 테이블 생성
- [x] `chore_completions` 테이블 생성
- [x] `chore_completion_events` 테이블 생성
- [x] foreign key 관계 설정
- [x] 기본 index 후보 검토
- [x] 기획서의 데이터 모델과 실제 SQL 비교
- [x] 차이가 있으면 기획서와 이 문서 함께 수정

확인 기준:

- Supabase Table Editor 또는 SQL Editor에서 테이블을 확인할 수 있다.
- 최소 샘플 데이터를 넣고 관계를 이해할 수 있다.

### Phase 8. RLS 정책

목표: Space 멤버십 기준으로 데이터 접근을 제한한다.

- [x] 각 테이블 RLS 활성화
- [x] Space 멤버만 Space 데이터 조회 가능하게 설정
- [x] Space 멤버만 Chore 조회 가능하게 설정
- [x] Space 멤버가 Chore 생성/수정/삭제 가능하게 설정
- [x] Space 멤버가 Completion 생성/삭제 가능하게 설정
- [x] 완료/완료 취소 이벤트 로그 생성/조회 정책 설정
- [x] 초대 코드 조회/사용 정책 설계
- [ ] 테스트 계정별 접근 가능/불가능 케이스 확인
- [x] RLS 정책과 기획서 권한 모델 비교

확인 기준:

- 같은 Space 멤버는 데이터를 볼 수 있다.
- 다른 Space 사용자는 데이터를 볼 수 없다.

### Phase 9. Space 기능

목표: 앱에서 Space를 만들고 선택하고 공유할 수 있게 한다.

- [x] 내 Space 목록 조회
- [x] 신규 사용자 기본 Space 자동 생성
- [x] Space 생성
- [x] Space 생성 시 만든 사용자를 `space_members`에 추가
- [x] Space 선택 상태 관리
- [x] 초대 코드 생성
- [x] 초대 코드 입력
- [x] 초대 코드 유효성 확인
- [x] 유효한 코드로 Space 참여
- [x] 멤버 목록 조회

확인 기준:

- 테스트 계정 A가 Space를 만든다.
- 테스트 계정 B가 초대 코드로 같은 Space에 참여한다.
- A와 B 모두 같은 Space를 볼 수 있다.

### Phase 10. Chore CRUD

목표: 반복 집안일을 생성, 조회, 수정, 삭제한다.

- [x] Chore 목록 조회
- [x] Chore 생성
- [x] 반복 타입 선택
- [x] `daily`, `weekly`, `monthly`, `interval_days` 입력 처리
- [x] Chore 수정
- [x] Chore 삭제 또는 비활성화
- [x] Space 멤버 간 변경 사항 확인
- [x] 입력 검증 추가

확인 기준:

- 같은 Space의 모든 멤버가 Chore를 생성, 수정, 삭제할 수 있다.

### Phase 11. 반복 계산 로직

목표: DB에 Occurrence를 저장하지 않고 프론트에서 현재 기간의 할 일을 계산한다.

- [x] 기간 계산 유틸 위치 결정
- [x] `date-fns` 도입 여부 결정
- [x] daily 기간 계산
- [x] weekly ISO 주차 계산
- [x] monthly 기간 계산
- [x] interval_days 기간 계산
- [x] `target_period_start` 계산
- [x] Completion과 조합해 완료 여부 계산
- [x] 오늘 화면에 현재 기간 미완료/완료 목록 표시
- [ ] 계산 예시를 문서에 추가할지 검토

확인 기준:

- weekly Chore는 한 주 안에 한 번 완료하면 완료 상태가 된다.
- 다음 주가 되면 다시 미완료 상태로 보인다.

### Phase 12. Completion 기능

목표: 현재 기간의 집안일을 완료하고 이력을 볼 수 있게 한다.

- [x] 완료 버튼 구현
- [x] `chore_completions` 생성
- [x] 같은 기간 중복 완료 방지
- [x] 완료 취소 구현
- [x] 완료자 표시
- [x] 완료 시간 표시
- [x] 완료 이력 화면 조회
- [x] 기간별 완료 목록 표시
- [x] 다른 사용자 화면에서 완료 상태 동기화 확인

확인 기준:

- 테스트 계정 A가 완료한 Chore를 테스트 계정 B도 완료 상태로 볼 수 있다.

### Phase 13. 사용성 정리

목표: MVP 사용 흐름을 매끄럽게 만든다.

- [~] 로딩 상태 정리
- [~] 에러 메시지 정리
- [~] 빈 상태 정리
- [x] 삭제 확인 흐름 추가
- [x] 완료 취소 확인 흐름 추가
- [x] 공용 확인 모달과 액션 바텀시트 분리
- [ ] 로그인 만료 상태 처리
- [x] Space가 없을 때 예외 상태와 복구 액션 명확화
- [ ] 앱 화면 형태 확정
- [ ] 확정된 앱 화면을 기준으로 Figma 화면과 컴포넌트 재정리
- [ ] Figma 재정리 결과를 기획서에 반영

확인 기준:

- 처음 로그인한 사용자도 다음 행동을 알 수 있다.
- 주요 실패 상황에서 앱이 멈추지 않는다.
- 구현된 앱 화면을 기준으로 다시 그릴 Figma 범위가 명확하다.

### Phase 14. MVP 점검

목표: MVP가 기획서의 범위를 만족하는지 확인한다.

- [ ] 사전 생성 계정 로그인 가능
- [ ] Space 생성 가능
- [ ] 초대 코드로 Space 참여 가능
- [ ] 멤버 목록 확인 가능
- [ ] Chore 생성/수정/삭제 가능
- [ ] 반복 주기 설정 가능
- [ ] 오늘 화면에서 현재 기간 할 일 확인 가능
- [ ] 완료 처리 가능
- [ ] 완료 이력 확인 가능
- [ ] RLS로 다른 Space 데이터 접근 차단
- [ ] Expo Go에서 실행 가능
- [ ] 기획서와 실제 구현 차이 정리
- [ ] 다음 개선 후보 정리

확인 기준:

- 두 개의 테스트 계정으로 공유 Space 사용 시나리오를 끝까지 수행할 수 있다.

## 5. 현재 다음 단계

다음에 진행할 단계는 Phase 13의 사용성 정리다.

현재 완료 이력 화면에서 완료/완료 취소 이벤트를 날짜별로 조회하고, 완료자와 시간을 표시한다.
오늘 화면의 반복 섹션과 개별 TODO 이력에는 현재 반복 기간을 표시한다.
하단 탭은 제거하고 홈 화면의 공통 헤더에서 Space 선택과 설정 진입을 제공한다.
완료 이력은 설정의 관리 메뉴에서 진입한다.
전체 TODO 관리 화면은 MVP에서 제외하고, TODO 수정/삭제는 홈의 각 TODO 메뉴에서 진입한다.
생성/수정/삭제/완료/완료 취소 흐름은 두 계정으로 공유 Space에서 확인했다.
사용자에게 보이는 앱 문구는 범용성을 위해 `집안일`보다 `할 일`을 우선 사용한다.

- 로딩 상태, 에러 메시지, 빈 상태를 화면별로 점검
- 홈과 스페이스 선택 화면의 Space 없음 예외, 로딩, 에러, 빈 상태 1차 정리 완료
- 로그인 만료 상태 처리
- 앱 화면 형태 확정
- 확정된 앱 화면을 기준으로 Figma 화면과 컴포넌트 재정리
