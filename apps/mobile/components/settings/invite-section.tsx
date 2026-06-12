import { createInviteCode, type SpaceInvite } from '@/lib/invites';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface InviteSectionProps {
  currentSpaceId: string | null;
}

export function InviteSection({ currentSpaceId }: InviteSectionProps) {
  const [invite, setInvite] = useState<SpaceInvite | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  const isInviteButtonDisabled = !currentSpaceId || isCreatingInvite;

  useEffect(() => {
    setInvite(null);
    setErrorMessage('');
    setCopyMessage('');
  }, [currentSpaceId]);

  async function handleCreateInviteCode() {
    if (!currentSpaceId) {
      setErrorMessage('먼저 스페이스를 선택해 주세요.');
      return;
    }

    setErrorMessage('');
    setCopyMessage('');
    setIsCreatingInvite(true);

    try {
      const nextInvite = await createInviteCode(currentSpaceId);
      setInvite(nextInvite);
      await copyInviteCode(nextInvite.code);
    } catch {
      setErrorMessage('초대 코드를 만들지 못했어요.');
    } finally {
      setIsCreatingInvite(false);
    }
  }

  async function copyInviteCode(code: string) {
    try {
      await Clipboard.setStringAsync(code);
      setCopyMessage('초대 코드를 복사했어요.');
      setErrorMessage('');
    } catch {
      setCopyMessage('');
      setErrorMessage('초대 코드를 복사하지 못했어요.');
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>초대</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="초대 코드 만들기"
        accessibilityState={{ disabled: isInviteButtonDisabled }}
        disabled={isInviteButtonDisabled}
        onPress={handleCreateInviteCode}
        style={({ pressed }) => [
          styles.secondaryButton,
          isInviteButtonDisabled && styles.secondaryButtonDisabled,
          pressed && !isInviteButtonDisabled && styles.secondaryButtonPressed,
        ]}
      >
        <Text style={styles.secondaryButtonText}>
          {isCreatingInvite ? '만드는 중...' : '초대 코드 만들기'}
        </Text>
      </Pressable>

      {invite ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="초대 코드 다시 복사"
          onPress={() => copyInviteCode(invite.code)}
          style={({ pressed }) => [styles.inviteCard, pressed && styles.inviteCardPressed]}
        >
          <Text style={styles.inviteCode}>{invite.code}</Text>
          <Text style={styles.cardMeta}>
            최대 {invite.maxUses ?? '-'}회, 1일 동안 사용할 수 있어요.
          </Text>
          <Text style={styles.copyHintText}>코드를 누르면 다시 복사돼요.</Text>
        </Pressable>
      ) : null}

      {copyMessage ? <Text style={styles.successText}>{copyMessage}</Text> : null}

      {errorMessage ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}
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
  cardMeta: {
    fontSize: 13,
    color: '#77776B',
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
  inviteCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E5DF',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
    gap: 6,
  },
  inviteCardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2520',
    letterSpacing: 2,
  },
  copyHintText: {
    fontSize: 13,
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
