import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const passwordInputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoginDisabled = email.trim().length === 0 || password.length === 0 || isSubmitting;

  async function handleLogin() {
    if (isLoginDisabled) {
      return;
    }

    const trimmedEmail = email.trim();

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // 로그인 시도, supabase 객체의 error 발생시 구조분해로 받아 에러 표출
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setErrorMsg('이메일 또는 비밀번호를 확인해 주세요.');
        return;
      }
      router.replace('/');
    } catch {
      // supabase 외부 오류
      setErrorMsg('잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>homeTodo</Text>
          <Text style={styles.subtitle}>함께 관리하는 반복 할 일</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              submitBehavior="submit"
              returnKeyType="next"
              placeholder="test@example.com"
              placeholderTextColor="#99998E"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              onChangeText={setEmail}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor="#99998E"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={handleLogin}
            />
          </View>

          {errorMsg ? (
            <Text accessibilityRole="alert" style={styles.errorMsg}>
              {errorMsg}
            </Text>
          ) : null}
          <Text style={styles.helperText}>MVP에서는 미리 생성된 테스트 계정으로 로그인해요.</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="로그인"
          accessibilityState={{ disabled: isLoginDisabled }}
          disabled={isLoginDisabled}
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            isLoginDisabled && styles.primaryButtonDisabled,
            pressed && !isLoginDisabled && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? '로그인 중...' : '로그인'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1F2520',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#77776B',
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#55564E',
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D7CD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1F2520',
  },
  errorMsg: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#B3261E',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#77776B',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  primaryButtonDisabled: {
    backgroundColor: '#B9B9B0',
  },
  primaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
