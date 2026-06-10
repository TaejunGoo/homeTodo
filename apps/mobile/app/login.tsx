import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoginDisabled = email.trim().length === 0 || password.length === 0;

  function handleLogin() {
    // Supabase Auth 연결 전까지는 홈으로 이동하는 흐름만 확인한다.
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>homeTodo</Text>
          <Text style={styles.subtitle}>함께 관리하는 집안일 TODO</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="test@example.com"
              placeholderTextColor="#99998E"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor="#99998E"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
            />
          </View>

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
          <Text style={styles.primaryButtonText}>로그인</Text>
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
