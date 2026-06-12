import { getSpaceRoleLabel, type MySpace } from '@/lib/spaces';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CurrentSpaceSectionProps {
  currentSpace: MySpace | null;
}

export function CurrentSpaceSection({ currentSpace }: CurrentSpaceSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>현재 스페이스</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="스페이스 선택"
        onPress={() => router.push('/select-space')}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{currentSpace?.name ?? '스페이스 없음'}</Text>
          {currentSpace ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{getSpaceRoleLabel(currentSpace.role)}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.cardMeta}>
          {currentSpace ? '함께 관리 중' : '스페이스를 선택해 주세요.'}
        </Text>
      </Pressable>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 4,
  },
  cardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2520',
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: '#E8F0EC',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F6F67',
  },
  cardMeta: {
    fontSize: 13,
    color: '#77776B',
  },
});
