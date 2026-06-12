import { getSpaceMembers, type SpaceMember } from '@/lib/spaces';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MembersSectionProps {
  currentSpaceId: string | null;
  refreshKey: number;
}

export function MembersSection({ currentSpaceId, refreshKey }: MembersSectionProps) {
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadMembers = useCallback(async (spaceId: string) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextMembers = await getSpaceMembers(spaceId);
      setMembers(nextMembers);
    } catch {
      setMembers([]);
      setErrorMessage('멤버 목록을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentSpaceId) {
      setMembers([]);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    loadMembers(currentSpaceId);
  }, [currentSpaceId, loadMembers, refreshKey]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>멤버</Text>

      {isLoading ? <Text style={styles.memberStatusText}>불러오는 중...</Text> : null}

      {!isLoading && errorMessage ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      {!isLoading && !errorMessage && members.length === 0 ? (
        <Text style={styles.memberStatusText}>
          {currentSpaceId ? '아직 멤버가 없어요.' : '스페이스를 선택하면 멤버가 보여요.'}
        </Text>
      ) : null}

      {members.map((member) => (
        <View key={member.id} style={styles.memberItem}>
          <Text style={styles.memberName}>{member.displayName}</Text>
        </View>
      ))}
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
  memberStatusText: {
    fontSize: 14,
    color: '#77776B',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    color: '#B23B2E',
  },
});
