import { getMyProfile, updateMyDisplayName } from '@/lib/profiles';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface DisplayNameSectionProps {
  currentUserEmail: string;
  onDisplayNameSaved: () => void;
}

export function DisplayNameSection({
  currentUserEmail,
  onDisplayNameSaved,
}: DisplayNameSectionProps) {
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [savedDisplayName, setSavedDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const trimmedDisplayName = displayNameInput.trim();
  const isSaveDisabled =
    trimmedDisplayName.length === 0 ||
    trimmedDisplayName === savedDisplayName ||
    isLoading ||
    isSaving;

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        const profile = await getMyProfile();

        if (!isCancelled) {
          setDisplayNameInput(profile.displayName);
          setSavedDisplayName(profile.displayName);
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage('표시 이름을 불러오지 못했어요.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [currentUserEmail]);

  async function handleSave() {
    if (isSaveDisabled) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const profile = await updateMyDisplayName(trimmedDisplayName);
      setDisplayNameInput(profile.displayName);
      setSavedDisplayName(profile.displayName);
      setSuccessMessage('저장했어요.');
      setIsEditing(false);
      onDisplayNameSaved();
    } catch {
      setErrorMessage('표시 이름을 저장하지 못했어요.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartEdit() {
    setDisplayNameInput(savedDisplayName);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setDisplayNameInput(savedDisplayName);
    setErrorMessage('');
    setSuccessMessage('');
    setIsEditing(false);
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, styles.sectionTitleInRow]}>표시 이름</Text>
        {!isEditing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="표시 이름 수정"
            disabled={isLoading}
            hitSlop={8}
            onPress={handleStartEdit}
            style={({ pressed }) => [
              styles.textButton,
              isLoading && styles.textButtonDisabled,
              pressed && !isLoading && styles.textButtonPressed,
            ]}
          >
            <Text style={styles.textButtonText}>수정</Text>
          </Pressable>
        ) : null}
      </View>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={displayNameInput}
            onChangeText={(nextDisplayName) => {
              setDisplayNameInput(nextDisplayName);
              setSuccessMessage('');
            }}
            placeholder={isLoading ? '불러오는 중...' : '표시 이름'}
            placeholderTextColor="#99998E"
            autoCorrect={false}
            editable={!isLoading && !isSaving}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="표시 이름 수정 취소"
              disabled={isSaving}
              onPress={handleCancelEdit}
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.buttonRowItem,
                isSaving && styles.secondaryButtonDisabled,
                pressed && !isSaving && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>취소</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="표시 이름 저장"
              accessibilityState={{ disabled: isSaveDisabled }}
              disabled={isSaveDisabled}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.buttonRowItem,
                isSaveDisabled && styles.primaryButtonDisabled,
                pressed && !isSaveDisabled && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>{isSaving ? '저장 중...' : '저장'}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isLoading ? '확인 중' : savedDisplayName || '이름 없음'}
          </Text>
          <Text style={styles.cardMeta}>멤버 목록에 이 이름으로 표시돼요.</Text>
        </View>
      )}

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  sectionTitleRow: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleInRow: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2520',
  },
  cardMeta: {
    fontSize: 13,
    color: '#77776B',
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
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonRowItem: {
    flex: 1,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F6F67',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  secondaryButtonDisabled: {
    borderColor: '#C9C7BD',
    backgroundColor: '#F1F0EA',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F6F67',
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  primaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    backgroundColor: '#B9B9B0',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textButton: {
    minHeight: 28,
    justifyContent: 'center',
  },
  textButtonPressed: {
    opacity: 0.72,
  },
  textButtonDisabled: {
    opacity: 0.4,
  },
  textButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F6F67',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#B23B2E',
  },
  successText: {
    marginTop: 2,
    marginBottom: 10,
    fontSize: 14,
    color: '#2F6F67',
  },
});
