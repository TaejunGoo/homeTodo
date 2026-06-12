import { useEffect, useState } from 'react';

import { useSpace } from '@/contexts/space-context';
import { createInviteCode, type SpaceInvite } from '@/lib/invites';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const members = [
  { id: 'member-taejun', name: '태준' },
  { id: 'member-hyejin', name: '혜진' },
];

export default function SettingsScreen() {
  const { currentSpace, currentSpaceId, currentUserEmail } = useSpace();
  const [invite, setInvite] = useState<SpaceInvite | null>(null);
  const [inviteError, setInviteError] = useState('');
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  const isInviteButtonDisabled = !currentSpaceId || isCreatingInvite;

  useEffect(() => {
    setInvite(null);
    setInviteError('');
  }, [currentSpaceId]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return;
    }
    router.replace('/login');
  }

  async function handleCreateInviteCode() {
    if (!currentSpaceId) {
      setInviteError('먼저 스페이스를 선택해 주세요.');
      return;
    }

    setInviteError('');
    setIsCreatingInvite(true);

    try {
      const nextInvite = await createInviteCode(currentSpaceId);
      setInvite(nextInvite);
    } catch {
      setInviteError('초대 코드를 만들지 못했어요.');
    } finally {
      setIsCreatingInvite(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.description}>스페이스와 멤버 정보를 관리해요.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>로그인 계정</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{currentUserEmail || '확인 중'}</Text>
          <Text style={styles.cardMeta}>현재 이 계정으로 앱을 사용 중이에요.</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 스페이스</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{currentSpace?.name ?? '스페이스 없음'}</Text>
          <Text style={styles.cardMeta}>
            {currentSpace ? '함께 관리 중' : '스페이스를 선택해 주세요.'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>멤버</Text>

        {members.map((member) => (
          <View key={member.id} style={styles.memberItem}>
            <Text style={styles.memberName}>{member.name}</Text>
          </View>
        ))}
      </View>

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
          <View style={styles.inviteCard}>
            <Text style={styles.inviteCode}>{invite.code}</Text>
            <Text style={styles.cardMeta}>
              1일 동안 사용할 수 있어요. 최대 {invite.maxUses ?? '-'}회
            </Text>
          </View>
        ) : null}

        {inviteError ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {inviteError}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="로그아웃"
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#77776B',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
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
  memberItem: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: '#1F2520',
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
  inviteCode: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2520',
    letterSpacing: 2,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#B23B2E',
  },
  logoutButton: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2E4E1',
  },
  logoutButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B23B2E',
  },
});
