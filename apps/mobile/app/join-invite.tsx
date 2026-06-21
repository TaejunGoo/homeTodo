import { ScreenHeading } from '@/components/screen-heading';
import { useSpace } from '@/contexts/space-context';
import { joinSpaceWithInviteCode } from '@/lib/invites';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinInviteScreen() {
  const { refreshSpaces, selectSpace } = useSpace();
  const [inviteCode, setInviteCode] = useState('');
  const [message, setMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const normalizedCode = inviteCode.trim().toUpperCase();
  const isJoinDisabled = normalizedCode.length === 0 || isJoining;

  async function handleJoin() {
    if (isJoinDisabled) {
      return;
    }

    setMessage('');
    setIsJoining(true);

    try {
      const joinedSpace = await joinSpaceWithInviteCode(normalizedCode);
      await refreshSpaces();
      selectSpace(joinedSpace.id);
      router.back();
    } catch {
      setMessage('유효하지 않거나 만료된 코드예요.');
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ScreenHeading
          title="초대 코드로 참여"
          description="공유받은 초대 코드를 입력해 스페이스에 참여해요."
          showBackButton
        />

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>초대 코드</Text>
            <TextInput
              style={styles.input}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="예: A8K2QZ9M"
              placeholderTextColor="#99998E"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleJoin}
            />
          </View>

          {message.length > 0 && (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="초대 코드로 참여"
          accessibilityState={{ disabled: isJoinDisabled }}
          disabled={isJoinDisabled}
          onPress={handleJoin}
          style={({ pressed }) => [
            styles.primaryButton,
            isJoinDisabled && styles.primaryButtonDisabled,
            pressed && !isJoinDisabled && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>{isJoining ? '참여 중...' : '참여'}</Text>
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
    padding: 20,
    paddingTop: 48,
  },
  form: {
    gap: 12,
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
    fontSize: 18,
    letterSpacing: 1,
    color: '#1F2520',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#B3261E',
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
