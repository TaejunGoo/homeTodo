import { ConfirmModal } from '@/components/confirm-modal';
import { deactivateChore, getChore, updateChore, type RecurrenceType } from '@/lib/chores';
import { getProfilesByIds } from '@/lib/profiles';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

export default function EditTodoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [intervalDays, setIntervalDays] = useState('3');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [createdByName, setCreatedByName] = useState('');
  const [createdAt, setCreatedAt] = useState('');

  const trimmedTitle = title.trim();
  const isSubmitDisabled = trimmedTitle.length === 0 || isLoading || isSaving || isDeleting;

  function closeEditScreen() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  const loadChore = useCallback(async () => {
    if (!id) {
      setErrorMessage('할 일을 찾지 못했어요.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const chore = await getChore(id);
      const profiles = await getProfilesByIds([chore.createdBy]);
      const creatorProfile = profiles[0];

      setTitle(chore.title);
      setRecurrenceType(chore.recurrenceType);
      setIntervalDays(String(chore.recurrenceValue ?? 3));
      setCreatedByName(creatorProfile?.displayName ?? '이름 없음');
      setCreatedAt(chore.createdAt);
    } catch {
      setErrorMessage('할 일을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadChore();
  }, [loadChore]);

  async function handleSave() {
    if (!id) {
      setErrorMessage('할 일을 찾지 못했어요.');
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
    setIsSaving(true);

    try {
      await updateChore({
        id,
        title: trimmedTitle,
        recurrenceType,
        recurrenceValue: recurrenceType === 'interval_days' ? intervalNumber : null,
      });
      Toast.show({
        type: 'success',
        text1: '할 일을 저장했어요.',
      });
      closeEditScreen();
    } catch {
      setErrorMessage('할 일을 저장하지 못했어요.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) {
      setErrorMessage('할 일을 찾지 못했어요.');
      return;
    }

    setErrorMessage('');
    setIsDeleting(true);

    try {
      await deactivateChore(id);
      Toast.show({
        type: 'success',
        text1: '할 일을 삭제했어요.',
      });
      setIsDeleteModalVisible(false);
      closeEditScreen();
    } catch {
      setErrorMessage('할 일을 삭제하지 못했어요.');
    } finally {
      setIsDeleting(false);
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
            onPress={closeEditScreen}
          >
            <Text style={styles.backText}>‹ 취소</Text>
          </Pressable>

          <Text style={styles.title}>할 일 수정</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          style={styles.formScroll}
        >
          {isLoading ? <Text style={styles.statusText}>할 일을 불러오는 중이에요.</Text> : null}

          {!isLoading ? (
            <>
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
                  onSubmitEditing={handleSave}
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
              </View>

              <View style={styles.infoBox}>
                <InfoRow label="등록자" value={createdByName || '이름 없음'} />
                <InfoRow label="등록일" value={createdAt ? formatDate(createdAt) : '-'} />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="할 일 삭제"
                disabled={isSaving || isDeleting}
                onPress={() => setIsDeleteModalVisible(true)}
                style={({ pressed }) => [
                  styles.dangerButton,
                  (isSaving || isDeleting) && styles.dangerButtonDisabled,
                  pressed && !isSaving && !isDeleting && styles.dangerButtonPressed,
                ]}
              >
                <Text style={styles.dangerButtonText}>할 일 삭제</Text>
              </Pressable>
            </>
          ) : null}

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="할 일 저장"
            disabled={isSubmitDisabled}
            style={({ pressed }) => [
              styles.primaryButton,
              isSubmitDisabled && styles.primaryButtonDisabled,
              pressed && !isSubmitDisabled && styles.primaryButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Text style={styles.primaryButtonText}>{isSaving ? '저장 중...' : '저장'}</Text>
          </Pressable>
        </View>

        <ConfirmModal
          confirmLabel={isDeleting ? '삭제 중...' : '삭제'}
          confirmVariant="danger"
          isConfirming={isDeleting}
          onCancel={() => setIsDeleteModalVisible(false)}
          onConfirm={handleDelete}
          title="할 일을 삭제할까요?"
          visible={isDeleteModalVisible}
        />
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

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
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
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#77776B',
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2520',
  },
  statusText: {
    fontSize: 14,
    color: '#77776B',
  },
  dangerButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8B8B2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8ECEA',
  },
  dangerButtonDisabled: {
    opacity: 0.6,
  },
  dangerButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B23B2E',
  },
  bottomAction: {
    borderTopWidth: 1,
    borderTopColor: '#E4E2DA',
    backgroundColor: '#F7F7F4',
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
