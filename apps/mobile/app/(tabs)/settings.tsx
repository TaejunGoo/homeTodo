import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const members = [
  { id: 'member-taejun', name: '태준' },
  { id: 'member-hyejin', name: '혜진' },
];

export default function SettingsScreen() {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return;
    }
    router.replace('/login');
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <Text style={styles.description}>스페이스와 멤버 정보를 관리해요.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>현재 스페이스</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>우리집</Text>
          <Text style={styles.cardMeta}>2명이 함께 관리 중</Text>
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
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>초대 코드 만들기</Text>
        </Pressable>
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
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F6F67',
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
