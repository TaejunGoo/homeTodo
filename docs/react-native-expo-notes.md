# React Native와 Expo 학습 노트

이 문서는 homeTodo를 만들면서 배운 React Native와 Expo의 핵심 개념을 짧게 누적하는 노트다.
React, Next.js, JavaScript 기본 문법보다 웹 개발과 달라지는 모바일 앱 개발 감각을 중심으로 기록한다.

## 1. React Native는 WebView 기반 하이브리드 앱이 아니다

React Native는 JavaScript/TypeScript로 작성한 React 컴포넌트 트리를 iOS와 Android의 네이티브 UI 컴포넌트로 렌더링한다.

개념적으로는 아래와 같다.

```text
JS/TS 코드 실행
React 컴포넌트 상태 계산
React Native가 UI 변경 사항 계산
iOS/Android 네이티브 UI에 반영
```

예시 매핑:

- `View`: iOS/Android의 기본 View 계열
- `Text`: 네이티브 텍스트 표시 컴포넌트 계열
- `ScrollView`: 네이티브 스크롤 컴포넌트 계열

따라서 React Native는 전통적인 WebView 하이브리드 앱보다 네이티브 앱에 가깝다.
다만 앱 로직의 많은 부분이 JavaScript 런타임에서 실행되므로 순수 Swift/Kotlin 앱보다 중간 계층이 있다.

## 2. React Native에는 DOM과 CSS가 없다

React Native는 React처럼 컴포넌트를 작성하지만 DOM을 렌더링하지 않는다.

웹 개발과의 기본 대응:

```text
div        -> View
span/p     -> Text
button     -> Pressable
overflow   -> ScrollView
CSS file   -> StyleSheet
onClick    -> onPress
```

중요한 규칙:

- 텍스트는 반드시 `Text` 안에 있어야 한다.
- `View` 안에 문자열을 직접 넣으면 에러가 난다.
- 스타일은 CSS 문자열이 아니라 JavaScript 객체다.

예시:

```tsx
<View>
  <Text>우리집</Text>
</View>
```

## 3. StyleSheet는 CSS와 비슷하지만 CSS가 아니다

React Native 스타일은 CSS와 닮았지만 문법과 지원 속성이 다르다.

웹 CSS:

```css
font-size: 16px;
border: 1px solid #eee;
transform: scale(0.96);
```

React Native:

```tsx
fontSize: 16,
borderWidth: 1,
borderColor: '#eee',
transform: [{ scale: 0.96 }],
```

숫자 값은 기본적으로 density-independent pixel 단위로 해석되며 `16px`처럼 문자열로 쓰지 않는다.

## 4. ScrollView의 style과 contentContainerStyle

`ScrollView`는 하나의 컴포넌트처럼 보이지만 개념적으로는 바깥 스크롤 영역과 안쪽 콘텐츠 영역을 구분해서 봐야 한다.

```tsx
<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
  ...
</ScrollView>
```

웹 감각으로 비유하면 아래와 같다.

```html
<div class="scroll-view">
  <div class="scroll-content">...</div>
</div>
```

사용 기준:

- `style`: 스크롤 영역 자체의 스타일
- `contentContainerStyle`: 스크롤 안쪽 실제 콘텐츠의 padding, 정렬, 간격

## 5. Safe Area는 웹의 env(safe-area-inset-\*)와 비슷한 개념이다

웹에서 iPhone 노치나 홈 인디케이터를 고려할 때 `env(safe-area-inset-bottom)`을 쓰듯이, React Native에서는 `react-native-safe-area-context`를 사용한다.

대표 사용 방식:

```tsx
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
```

- `SafeAreaView`: 안전 영역 inset을 padding으로 반영해주는 View 계열 컴포넌트
- `useSafeAreaInsets`: safe area 값을 직접 꺼내 커스텀 위치 계산에 사용하는 hook

예를 들어 플로팅 버튼 위치는 아래처럼 계산할 수 있다.

```tsx
const insets = useSafeAreaInsets();

<Pressable style={[styles.floatingButton, { bottom: insets.bottom + 24 }]} />;
```

웹으로 비유하면 아래와 비슷하다.

```css
bottom: calc(env(safe-area-inset-bottom) + 24px);
```

## 6. React Native에는 position: fixed가 없다

React Native에서 `position`은 주로 `relative`와 `absolute`를 사용한다.
CSS의 `position: fixed`는 없다.

화면에 고정된 것처럼 보이는 FAB나 하단 버튼은 보통 스크롤 영역 밖에 두고, 최상위 컨테이너 기준 `absolute`로 배치한다.

```tsx
<SafeAreaView style={styles.safeArea}>
  <ScrollView contentContainerStyle={styles.scrollContent}>...</ScrollView>

  <Pressable style={styles.floatingButton}>
    <Text>+</Text>
  </Pressable>
</SafeAreaView>
```

구조적으로는 아래처럼 생각한다.

```text
화면 컨테이너
  스크롤 영역
    실제 콘텐츠
  오버레이 영역
    FAB, 하단 고정 버튼, 토스트 등
```

## 7. Pressable은 눌림 상태를 직접 스타일링할 수 있다

`Pressable`의 `style`에는 객체뿐 아니라 함수를 줄 수 있다.
이 함수는 `pressed` 상태를 받아 눌리는 동안의 스타일을 바꿀 수 있다.

```tsx
<Pressable
  accessibilityRole="button"
  accessibilityLabel="TODO 만들기"
  style={({ pressed }) => [styles.floatingButton, pressed && styles.floatingButtonPressed]}
>
  <Text>+</Text>
</Pressable>
```

```tsx
floatingButtonPressed: {
  opacity: 0.72,
  transform: [{ scale: 0.96 }],
}
```

웹의 `:active`와 비슷한 역할로 이해할 수 있다.

## 8. hitSlop은 보이는 크기와 터치 영역을 분리한다

모바일에서는 작은 아이콘이라도 실제 터치 영역은 충분히 커야 한다.
`hitSlop`은 보이는 레이아웃을 키우지 않고 터치 가능한 영역만 넓힌다.

```tsx
<Pressable hitSlop={8}>
  <Text>+</Text>
</Pressable>
```

비교:

- `padding`: 보이는 레이아웃도 커진다.
- `hitSlop`: 보이는 크기는 유지하고 터치 영역만 커진다.

`hitSlop`은 웹 프리뷰보다 Expo Go나 실제 기기에서 더 명확하게 체감된다.

## 9. 웹 프리뷰와 Expo Go는 확인 목적이 다르다

Expo 웹 프리뷰는 빠른 레이아웃 확인에 유용하지만, 모바일 특성은 실제 기기 기준으로 확인해야 한다.

확인 기준:

- 웹 프리뷰: 빠른 레이아웃, 텍스트, 기본 스타일 확인
- Expo Go/실제 기기: 터치 영역, 제스처, Safe Area, 키보드, 플랫폼별 UI 느낌 확인

## 10. React Native의 View 계열은 기본적으로 flex 레이아웃이다

React Native는 웹 CSS처럼 `display: block`, `inline`, `grid`를 중심으로 레이아웃하지 않는다.
기본 레이아웃 모델은 Yoga 기반 Flexbox다.

따라서 `View`, `Pressable` 같은 View 계열 컴포넌트는 `display: 'flex'`를 명시하지 않아도 flex 컨테이너처럼 동작한다.
Expo 웹 프리뷰에서는 React Native Web이 이를 DOM/CSS로 변환하므로 개발자 도구에서 `display: flex`가 보일 수 있다.

즉 아래 스타일은 React Native에서 자연스러운 패턴이다.

```tsx
floatingButton: {
  width: 56,
  height: 56,
  borderRadius: 28,
  alignItems: 'center',
  justifyContent: 'center',
}
```

웹 CSS라면 `display: flex`가 필요하지만, React Native에서는 보통 생략한다.

## 11. 텍스트 수직 정렬은 웹과 네이티브에서 다르게 보일 수 있다

React Native Web은 `Text`를 DOM 텍스트 요소로 렌더링하고, Expo Go는 iOS/Android 네이티브 텍스트 컴포넌트로 렌더링한다.
이 때문에 같은 `fontSize`, `lineHeight`, `alignItems`, `justifyContent`를 써도 텍스트의 시각적 중앙이 다르게 보일 수 있다.

특히 `+` 같은 단일 문자는 폰트의 ascender, descender, baseline, line box 차이 때문에 플랫폼별로 위아래 위치가 달라 보이기 쉽다.

아이콘 버튼 안에서는 텍스트 문자보다 벡터 아이콘을 쓰는 편이 더 안정적이다.
텍스트를 계속 쓴다면 `lineHeight`를 버튼 높이와 맞추기보다, 부모의 `alignItems`와 `justifyContent`에 맡기고 불필요한 lineHeight를 줄이는 편이 낫다.

## 12. Expo Router의 Stack은 기본 헤더를 자동으로 보여준다

Expo Router에서 `app/create-todo.tsx` 같은 라우트 파일을 만들면 루트 `Stack`의 화면으로 등록된다.
별도 옵션을 주지 않으면 Stack은 기본 네이티브 헤더를 자동으로 표시한다.

화면 내부에 직접 커스텀 헤더를 만들었다면 루트 레이아웃에서 해당 화면의 기본 헤더를 숨겨야 한다.

```tsx
<Stack.Screen name="create-todo" options={{ headerShown: false }} />
```

기준:

- Stack 기본 헤더를 사용할 화면: 별도 커스텀 헤더를 만들지 않는다.
- 직접 만든 헤더를 사용할 화면: `headerShown: false`로 기본 헤더를 숨긴다.

## 13. push, replace, back은 스택 기대와 맞춰 사용한다

Expo Router의 라우팅은 URL 기반이지만, 모바일에서는 Stack Navigation의 화면 쌓기 감각이 중요하다.

```text
router.push('/create-todo')
현재 화면 위에 새 화면을 쌓는다.

router.replace('/')
현재 화면을 새 화면으로 교체한다.

router.back()
현재 top 화면을 걷어내고 이전 화면으로 돌아간다.
```

기준:

- 상세, 작성, 설정, 선택 화면으로 들어갈 때: `push`
- 로그인 성공, 온보딩 완료처럼 이전 화면으로 돌아가면 어색할 때: `replace`
- 취소, 닫기, 저장 후 이전 맥락으로 복귀할 때: `back`

주의할 패턴:

```text
홈 -> push create-todo -> push 홈
```

이렇게 하면 스택이 `[홈, create-todo, 홈]`처럼 쌓일 수 있고, 홈에서 뒤로 갔을 때 다시 작성 화면이 나오는 어색한 경험이 생긴다.
기준점 화면인 홈, 로그인, 탭 메인 화면은 불필요하게 `push`로 다시 쌓지 않는 편이 좋다.

`Stack.Screen`을 나열한 순서는 z-index처럼 뒤에 있을수록 위에 뜬다는 뜻이 아니다.
`Stack.Screen`은 특정 라우트에 어떤 옵션을 줄지 선언하는 목록에 가깝다.

```tsx
<Stack>
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="create-todo" options={{ headerShown: false }} />
</Stack>
```

실제 화면이 위에 쌓이는 순서는 선언 순서가 아니라 `router.push`, `router.replace`, `router.back` 같은 navigation action이 결정한다.
따라서 `Stack.Screen` 순서는 앱 흐름을 사람이 읽기 좋은 순서로 정리하면 된다.

## 14. TextInput의 onChangeText는 문자열을 바로 받는다

React Native의 `TextInput`도 웹 React의 controlled input과 비슷하게 `value`와 상태를 연결한다.
하지만 웹의 `input`과 달리 문자열 변경만 다룰 때는 `onChangeText`를 주로 사용한다.

웹 React:

```tsx
<input value={title} onChange={(event) => setTitle(event.target.value)} />
```

React Native:

```tsx
<TextInput value={title} onChangeText={setTitle} />
```

`onChangeText`는 이벤트 객체가 아니라 변경된 문자열을 바로 넘긴다.
그래서 `setTitle`을 그대로 전달할 수 있다.

모바일 입력에서는 아래 속성도 자주 사용한다.

- `autoCapitalize`: 자동 대문자 제어
- `autoCorrect`: 자동 교정 제어
- `returnKeyType`: 키보드 오른쪽 아래 버튼 표시
- `keyboardType`: 이메일, 숫자, 전화번호 등 키보드 타입 제어

예를 들어 `returnKeyType="done"`은 Android Expo Go에서 키보드 엔터 자리에 `완료`처럼 플랫폼/언어 설정에 맞는 라벨로 표시될 수 있다.

`TextInput`의 `value`는 문자열이다.
`keyboardType="number-pad"`를 사용해 숫자 키패드를 띄워도 입력값 자체는 string으로 들어온다.
따라서 숫자로 저장하거나 검증해야 할 값은 입력 상태에서는 string으로 들고 있다가 제출 시점에 `Number(...)` 또는 `parseInt(...)`로 변환하는 편이 자연스럽다.

## 15. 입력값은 제출 시점에 정리하고 검증한다

문자열 입력은 저장 전에 `trim()`으로 앞뒤 공백을 제거한다.
사용자가 공백만 입력한 값을 유효한 제목으로 저장하지 않기 위해서다.

```tsx
const trimmedTitle = title.trim();

if (trimmedTitle.length === 0) {
  setErrorMessage('제목을 입력해주세요.');
  return;
}
```

숫자 입력은 `TextInput`에서 string으로 들어오므로 제출 시점에 number로 변환하고 검증한다.

```tsx
const intervalNumber = Number(intervalDays);

if (!Number.isInteger(intervalNumber) || intervalNumber < 1) {
  setErrorMessage('반복 간격은 1 이상의 숫자로 입력해주세요.');
  return;
}
```

`Number.isInteger(...)`는 값이 정수인지 확인한다.
`N일마다` 반복 간격은 `1`, `2`, `3` 같은 양의 정수여야 하므로 `0`, `-1`, `1.5`, `NaN` 같은 값은 막는다.

날짜는 임시로 아래처럼 ISO 문자열의 날짜 부분만 잘라 사용했다.

```tsx
const today = new Date().toISOString().slice(0, 10);
```

이 값은 `YYYY-MM-DD` 형식이다.
다만 `toISOString()`은 UTC 기준이므로 한국 시간 기준의 오늘 날짜와 어긋날 수 있다.
실제 반복 계산 단계에서는 로컬 날짜 또는 명시적인 날짜 유틸로 다시 다룬다.

## 16. JSON.stringify의 두 번째와 세 번째 인자

`JSON.stringify(value, replacer, space)`는 JavaScript 값을 JSON 문자열로 바꾼다.

```tsx
JSON.stringify(payload, null, 2);
```

두 번째 인자인 `replacer`는 특정 필드를 제외하거나 값을 바꿔 직렬화하고 싶을 때 사용한다.
지금은 별도 가공이 필요 없으므로 `null`을 넣었다.

세 번째 인자인 `space`는 들여쓰기 간격이다.
`2`를 넣으면 사람이 읽기 좋은 2칸 들여쓰기 JSON 문자열이 만들어진다.

```json
{
  "title": "화장실 청소",
  "recurrence_type": "weekly"
}
```

`space`를 생략하면 한 줄 JSON이 된다.

## 17. 중첩 Pressable은 피하고 형제 터치 영역으로 나눈다

행 전체와 더보기 메뉴처럼 서로 다른 터치 액션이 필요할 때는 `Pressable` 안에 또 다른 `Pressable`을 넣지 않는 편이 좋다.
웹에서 `button` 안에 `button`을 넣지 않는 것과 비슷하다.

권장 구조:

```tsx
<View style={styles.item}>
  <Pressable style={styles.mainArea} onPress={onPress}>
    <Text>화장실 청소</Text>
  </Pressable>

  <Pressable onPress={onMenuPress}>
    <Text>...</Text>
  </Pressable>
</View>
```

이렇게 두 터치 영역을 형제로 두면 이벤트 흐름과 접근성 역할이 더 명확하다.

## 18. React Native에는 HTML checkbox input이 없다

React Native에는 DOM이 없으므로 웹의 `<input type="checkbox" />`도 없다.
체크 UI는 보통 아래 방식 중 하나로 만든다.

- `Pressable`로 직접 체크박스 모양을 구현한다.
- 설정성 토글에는 네이티브 `Switch`를 사용한다.
- 네이티브 체크박스가 필요하면 Expo 호환 라이브러리나 커뮤니티 패키지를 검토한다.

TODO 완료 체크처럼 작고 단순한 상태 표시는 MVP 단계에서 `Pressable`과 `Text`/아이콘으로 직접 만드는 방식이 충분하다.
다만 실제 체크박스 역할로 동작한다면 `accessibilityRole="checkbox"`와 `accessibilityState={{ checked }}`를 함께 고려한다.

## 19. 화면 제목 블록은 Header보다 Heading에 가깝다

`ScreenHeading`은 상단 고정 navigation header가 아니라 화면의 제목과 설명을 묶는 제목 블록이다.

```tsx
<ScreenHeading
  title="스페이스 선택"
  description="함께 관리할 집안일 공간을 선택해요."
  showBackButton
/>
```

나중에 현재 Space 선택, 우측 액션, 메뉴 버튼 등을 포함하는 앱 상단 바가 필요하면 별도의 `AppHeader`로 분리한다.

## 20. ActivityIndicator는 React Native 기본 로딩 컴포넌트다

`ActivityIndicator`는 React Native가 제공하는 기본 로딩 스피너다.
iOS와 Android에서는 플랫폼의 네이티브 느낌에 맞는 로딩 인디케이터로 표시되고, web에서는 React Native Web이 대응되는 표시로 변환한다.

```tsx
import { ActivityIndicator } from 'react-native';

<ActivityIndicator color="#2F6F67" size="small" />;
```

공통 로딩 UI를 만들 때는 `accessibilityRole="progressbar"`를 함께 고려한다.

## 21. 에러 상태는 alert 역할을 줄 수 있다

사용자에게 오류 상태를 명확히 알려주는 UI는 `accessibilityRole="alert"`를 고려한다.

```tsx
<View accessibilityRole="alert">
  <Text>문제가 발생했어요</Text>
  <Text>TODO 목록을 불러오지 못했어요.</Text>
</View>
```

재시도 버튼이 있으면 `Pressable`에 `accessibilityRole="button"`과 명확한 `accessibilityLabel`을 함께 둔다.

## 22. Supabase Auth는 저장소와 앱 생명주기를 함께 봐야 한다

React Native 앱에서 Supabase Auth를 사용할 때는 로그인 요청만 연결하는 것이 아니라, 세션을 어디에 저장하고 토큰 갱신을 언제 수행할지도 함께 결정해야 한다.

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});
```

- `persistSession`: 앱을 껐다 켜도 로그인 세션을 유지한다.
- `autoRefreshToken`: access token이 만료되기 전에 refresh token으로 세션을 갱신한다.
- `AsyncStorage`: iOS/Android에서 세션을 저장할 공간이다. 웹의 localStorage와 비슷한 역할로 이해할 수 있다.
- `detectSessionInUrl: false`: 모바일 앱에서는 웹 URL에서 세션을 읽는 흐름을 기본으로 쓰지 않기 때문에 꺼둔다.

웹과 네이티브 앱은 저장소와 생명주기가 다르므로 `Platform.OS !== 'web'` 같은 분기가 필요할 수 있다.
웹에서는 Supabase가 브라우저 저장소를 사용할 수 있고, 네이티브 앱에서는 `AsyncStorage`를 명시하는 편이 자연스럽다.

`AppState`를 함께 사용하면 앱이 foreground일 때만 토큰 자동 갱신을 돌리고, background로 내려가면 멈출 수 있다.
이 처리는 로그인 유지뿐 아니라 배터리 사용량과 앱 생명주기 관리에도 영향을 준다.

## 23. Promise, async, await는 비동기 결과를 다루는 문법이다

네트워크 요청처럼 시간이 걸리는 작업은 즉시 결과를 반환하지 않는다.
JavaScript에서는 이런 "나중에 끝나는 작업"의 결과를 `Promise`로 표현한다.

```ts
const promise = supabase.auth.signInWithPassword({
  email,
  password,
});
```

`async function`은 항상 `Promise`를 반환한다.
함수 안에서 일반 값을 `return`해도 실제 호출자는 Promise로 감싼 값을 받는다.

```ts
async function getName() {
  return '태준';
}

const name = await getName();
```

`await`는 Promise가 처리될 때까지 해당 `async` 함수의 다음 줄 실행을 기다린다.
앱 전체가 멈추는 것은 아니며, 화면 렌더링이나 다른 이벤트 처리는 계속될 수 있다.

Promise는 `then/catch`로도 처리할 수 있고, `async/await`와 `try/catch`로도 처리할 수 있다.

```ts
try {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setErrorMessage('이메일 또는 비밀번호를 확인해 주세요.');
    return;
  }
} catch {
  setErrorMessage('잠시 후 다시 시도해 주세요.');
}
```

Supabase Auth의 일반적인 로그인 실패는 함수가 예외를 던지기보다 응답 객체의 `error`에 담긴다.
반면 네트워크 문제나 예상하지 못한 런타임 오류는 `catch`에서 처리할 수 있다.
`finally`는 성공, 실패, `return` 여부와 관계없이 마지막에 실행되므로 로딩 상태를 끄는 데 적합하다.

## 24. Auth와 Session은 역할이 다르다

Auth는 사용자가 누구인지 확인하는 인증 과정이다.
이메일/비밀번호, 매직링크, OAuth 같은 방식으로 인증할 수 있다.

인증이 성공하면 Supabase는 session을 발급한다.
session에는 user 정보, access token, refresh token 등이 들어 있고, 앱은 이 session을 로컬 저장소에 보관한다.

```text
Auth 성공
-> session 발급
-> 앱 저장소에 session 저장
-> 이후 Supabase 요청에서 token으로 로그인 상태 증명
```

session은 로그인 상태를 증명하는 토큰 묶음에 가깝다.
실제 DB row 접근 권한은 나중에 RLS policy가 token의 사용자 정보를 바탕으로 판단한다.

```sql
auth.uid() = user_id
```

즉, session은 "누구인지"를 증명하고, RLS는 "무엇을 할 수 있는지"를 제한한다.

## 25. AuthGate는 보안 장치라기보다 UX와 라우팅 장치다

`AuthGate`는 앱 진입 시 저장된 session을 확인하고, 로그인 상태에 맞는 route로 정리하는 컴포넌트다.

```tsx
<AuthGate>
  <Stack />
</AuthGate>
```

Expo Router에서는 루트 `Stack`을 조건부로 없애기보다 항상 마운트해 두고, session 확인 중에는 overlay를 덮는 방식이 무난하다.
라우팅 구조가 준비된 상태에서 `router.replace`를 호출할 수 있기 때문이다.

```tsx
return (
  <>
    {children}
    {!isAuthReady ? <View style={styles.authLoadingScreen} /> : null}
  </>
);
```

이 overlay는 보안 장치가 아니라 로그인 화면이 잠깐 보이는 auth flicker를 줄이는 UX 장치다.
웹에서는 개발자 도구로 overlay를 숨길 수 있고, route guard도 클라이언트에서 우회될 수 있다.

따라서 보안의 최종 방어선은 클라이언트 화면 가드가 아니라 Supabase RLS다.

```text
AuthGate
= 자연스러운 화면 흐름과 깜빡임 방지

Supabase Auth
= 사용자가 누구인지 확인

RLS Policy
= 서버에서 이 사용자가 이 데이터에 접근 가능한지 판단
```

## 26. 관계형 DB는 테이블을 나누고 foreign key로 연결한다

관계형 데이터베이스에서는 데이터를 한 객체에 중첩해서 저장하기보다 의미별 테이블로 나누고, `id`와 foreign key로 관계를 표현한다.

```text
spaces
= 공간 자체의 정보

space_members
= 어떤 user가 어떤 space에 속해 있는지 나타내는 연결표
```

`space_members`는 user id 배열을 가진 테이블이 아니라, row 하나가 하나의 멤버십을 뜻한다.

```text
space_id | user_id
---------|--------
space-1  | user-A
space-1  | user-B
space-2  | user-A
```

foreign key는 이 컬럼의 값이 다른 테이블의 특정 컬럼 값 중 하나여야 한다는 제약이다.

```text
space_members.space_id -> spaces.id
```

이 관계가 있으면 DB는 `space_members.space_id` 값을 따라 `spaces.id`와 연결된 row를 찾을 수 있다.
Supabase/PostgREST는 이 foreign key 관계를 알고 있기 때문에 nested select를 지원한다.

```ts
supabase.from('space_members').select(`
  space_id,
  spaces (
    id,
    name
  )
`);
```

이 코드는 `space_members`에서 시작해서, 각 row의 `space_id`가 가리키는 `spaces` row의 `id`, `name`을 함께 가져온다.

다만 화면이 원하는 데이터가 space 목록이라면 `spaces`에서 시작하는 쿼리가 더 읽기 좋을 수 있다.

```ts
supabase
  .from('spaces')
  .select(
    `
    id,
    name,
    space_members!inner (
      user_id
    )
  `,
  )
  .eq('space_members.user_id', userId);
```

이 쿼리는 `spaces`를 가져오되, `space_members`에 현재 user가 연결된 row만 남긴다.

## 27. RLS는 앱 쿼리 아래에 깔리는 강제 보안 조건이다

클라이언트 쿼리의 `.eq(...)` 조건은 원하는 데이터를 좁히는 필터다.
하지만 사용자가 클라이언트 코드를 조작할 수 있으므로, 보안은 RLS policy가 강제해야 한다.

```ts
supabase
  .from('space_members')
  .select(...)
  .eq('user_id', user.id);
```

위 조건은 "내 membership만 조회하고 싶다"는 앱의 의도다.
RLS는 이 요청에 추가로 "이 row를 현재 사용자가 볼 수 있는가?"를 판단한다.

현재 `space_members` select policy는 아래 의미에 가깝다.

```text
현재 사용자가 이 row의 space_id에 속한 멤버라면 볼 수 있다.
```

그래서 내가 `space-1`의 멤버라면 `space-1`에 속한 다른 멤버십 row도 볼 수 있다.
이는 나중에 멤버 목록을 보여주기 위한 의도적인 권한 모델이다.

```text
자기 row만 조회 가능
= auth.uid() = user_id

내가 속한 space의 멤버십 row 조회 가능
= is_space_member(space_id, auth.uid())
```

공동 TODO 앱에서는 같은 space의 멤버 목록을 보여줘야 하므로 후자의 모델이 자연스럽다.

## 28. Supabase generated types와 제네릭

Supabase CLI로 생성한 `Database` 타입은 현재 DB의 테이블, 컬럼, 관계 정보를 TypeScript 타입으로 담고 있다.

```ts
import type { Database } from './database.types';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, ...);
```

`<Database>`는 제네릭 인자다.
제네릭은 값이 아니라 타입을 인자로 넣어서 함수나 타입을 구체화하는 문법이다.

```ts
Array<string>;
Promise<User>;
createClient<Database>;
```

`createClient<Database>()`는 Supabase client에게 "이 client는 이 DB 구조를 기준으로 동작한다"는 타입 정보를 준다.
그래서 `supabase.from('spaces')` 같은 쿼리에서 테이블과 컬럼 타입을 추론할 수 있다.

`QueryData`는 `@supabase/supabase-js`가 제공하는 유틸리티 타입이다.
CLI가 생성한 타입이 아니라, 특정 Supabase query가 성공했을 때의 `data` 타입을 추출하는 도구다.

```ts
const spacesQuery = supabase.from('spaces').select('id, name');

type SpacesQueryData = QueryData<typeof spacesQuery>;
```

여기서 `typeof spacesQuery`는 `spacesQuery` 변수의 TypeScript 타입을 가져온다.
`QueryData<typeof spacesQuery>`는 이 쿼리를 실행했을 때 예상되는 `data` 타입을 계산한다.

중요한 구분:

```text
Database
= 우리 DB 스키마 타입. Supabase CLI가 생성한다.

QueryData
= 특정 query의 data 타입을 뽑는 유틸리티 타입. supabase-js가 제공한다.
```

## 29. 화면에서는 Supabase 쿼리를 직접 다루기보다 내부 API 함수로 감싼다

Supabase client를 직접 쓰면 프론트 코드가 테이블, foreign key, nested select, RLS를 더 많이 의식하게 된다.
전통적인 백엔드 API가 있으면 이런 관계형 DB 조회와 응답 가공은 보통 백엔드가 맡는다.

Supabase direct client 방식에서는 앱 안에 작은 API 레이어를 두면 화면 코드가 훨씬 단순해진다.

```text
select-space.tsx
= 화면 상태와 렌더링

lib/spaces.ts
= Supabase 쿼리와 응답 정리
```

예를 들어 화면에서는 아래처럼 사용한다.

```ts
const spaces = await getMySpaces(user.id);
```

그리고 `lib/spaces.ts` 안에서 실제 DB 쿼리와 응답 변환을 처리한다.

```ts
export async function getMySpaces(userId: string): Promise<MySpace[]> {
  const result = await mySpacesQuery(userId);

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []).map((space) => ({
    id: space.id,
    name: space.name,
  }));
}
```

이렇게 하면 화면은 `getMySpaces`라는 프론트용 인터페이스만 알면 된다.
나중에 내부 구현이 Supabase query에서 Edge Function이나 별도 API 호출로 바뀌어도 화면 코드는 크게 흔들리지 않는다.
