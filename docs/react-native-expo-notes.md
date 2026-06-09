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
