import { StyleSheet, Text, View } from 'react-native';

interface AccountSectionProps {
  email: string;
}

export function AccountSection({ email }: AccountSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>로그인 계정</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{email || '확인 중'}</Text>
        <Text style={styles.cardMeta}>현재 이 계정으로 앱을 사용 중이에요.</Text>
      </View>
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
});
