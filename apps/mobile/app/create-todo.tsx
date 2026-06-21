import { useSpace } from '@/contexts/space-context';
import { createChore, type RecurrenceType } from '@/lib/chores';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const recurrenceOptions: { label: string; value: RecurrenceType }[] = [
  { label: '매일', value: 'daily' },
  { label: '매주', value: 'weekly' },
  { label: '매월', value: 'monthly' },
  { label: 'N일마다', value: 'interval_days' },
];

export default function CreateTodoScreen() {
  const { currentSpaceId } = useSpace();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [intervalDays, setIntervalDays] = useState('3');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const isSubmitDisabled = trimmedTitle.length === 0 || isSubmitting;

  async function handleCreate() {
    if (!currentSpaceId) {
      setErrorMessage('먼저 스페이스를 선택해 주세요.');
      return;
    }

    if (trimmedTitle.length === 0) {
      setErrorMessage('제목을 입력해 주세요.');
      return;
    }

    const intervalNumber = Number(intervalDays);

    if (
      recurrenceType === 'interval_days' &&
      (!Number.isInteger(intervalNumber) || intervalNumber <= 0)
    ) {
      setErrorMessage('반복 간격은 1 이상의 정수여야 해요.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await createChore({
        spaceId: currentSpaceId,
        title: trimmedTitle,
        recurrenceType,
        recurrenceValue: recurrenceType === 'interval_days' ? intervalNumber : null,
        startDate: getTodayDateString(),
      });
      Toast.show({
        type: 'success',
        text1: '할 일을 만들었어요.',
      });
      router.back();
    } catch {
      setErrorMessage('할 일을 만들지 못했어요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            hitSlop={8}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹ 취소</Text>
          </Pressable>

          <Text style={styles.title}>할 일 만들기</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          style={styles.formScroll}
        >
          <View style={styles.field}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 주간 회고"
              placeholderTextColor="#99998E"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={handleCreate}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>반복 주기</Text>

            <View style={styles.segmentGroup}>
              {recurrenceOptions.map((option) => (
                <RecurrenceOptionButton
                  key={option.value}
                  label={option.label}
                  selected={option.value === recurrenceType}
                  onPress={() => setRecurrenceType(option.value)}
                />
              ))}
            </View>

            {recurrenceType === 'interval_days' ? (
              <View style={styles.intervalField}>
                <Text style={styles.label}>반복 간격</Text>
                <TextInput
                  style={styles.input}
                  value={intervalDays}
                  onChangeText={setIntervalDays}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  placeholder="예: 3"
                  placeholderTextColor="#99998E"
                />
              </View>
            ) : null}

            {errorMessage ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="할 일 생성"
            disabled={isSubmitDisabled}
            style={({ pressed }) => [
              styles.primaryButton,
              isSubmitDisabled && styles.primaryButtonDisabled,
              pressed && !isSubmitDisabled && styles.primaryButtonPressed,
            ]}
            onPress={handleCreate}
          >
            <Text style={styles.primaryButtonText}>{isSubmitting ? '생성 중...' : '생성'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface RecurrenceOptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function RecurrenceOptionButton({ label, selected, onPress }: RecurrenceOptionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segment,
        selected && styles.segmentSelected,
        pressed && styles.segmentPressed,
      ]}
    >
      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 17,
    color: '#2F6F67',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
  },
  headerSpacer: {
    width: 52,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 32,
    gap: 24,
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
  segmentGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D7CD',
  },
  segmentSelected: {
    backgroundColor: '#2F6F67',
    borderColor: '#2F6F67',
  },
  segmentPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  segmentText: {
    fontSize: 15,
    color: '#55564E',
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  intervalField: {
    marginTop: 12,
    gap: 8,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButtonDisabled: {
    backgroundColor: '#B9B9B0',
  },
  primaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  errorText: {
    fontSize: 14,
    color: '#C0392B',
  },
});
