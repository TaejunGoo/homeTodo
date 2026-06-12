import { ScreenHeading } from '@/components/screen-heading';
import { useSpace } from '@/contexts/space-context';
import { createSpace } from '@/lib/spaces';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateSpaceScreen() {
  const { refreshSpaces, selectSpace } = useSpace();
  const [spaceName, setSpaceName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedSpaceName = spaceName.trim();
  const isSubmitDisabled = trimmedSpaceName.length === 0 || isSubmitting;

  async function handleCreateSpace() {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const newSpace = await createSpace(trimmedSpaceName);

      await refreshSpaces();
      selectSpace(newSpace.id);
      router.back();
    } catch {
      setErrorMessage('스페이스를 만들지 못했어요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ScreenHeading
          title="새 스페이스"
          description="함께 관리할 집안일 공간을 만들어요."
          showBackButton
        />

        <View style={styles.field}>
          <Text style={styles.label}>스페이스 이름</Text>
          <TextInput
            style={styles.input}
            value={spaceName}
            onChangeText={setSpaceName}
            placeholder="예: 우리집"
            placeholderTextColor="#99998E"
            returnKeyType="done"
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="스페이스 만들기"
          accessibilityState={{ disabled: isSubmitDisabled }}
          disabled={isSubmitDisabled}
          onPress={handleCreateSpace}
          style={({ pressed }) => [
            styles.primaryButton,
            isSubmitDisabled && styles.primaryButtonDisabled,
            pressed && !isSubmitDisabled && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? '만드는 중...' : '스페이스 만들기'}
          </Text>
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
  field: {
    gap: 8,
    marginBottom: 16,
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
  errorText: {
    marginBottom: 12,
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
