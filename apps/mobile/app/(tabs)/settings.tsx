import { AccountSection } from '@/components/settings/account-section';
import { CurrentSpaceSection } from '@/components/settings/current-space-section';
import { DisplayNameSection } from '@/components/settings/display-name-section';
import { InviteSection } from '@/components/settings/invite-section';
import { MembersSection } from '@/components/settings/members-section';
import { useSpace } from '@/contexts/space-context';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { currentSpace, currentSpaceId, currentUserEmail } = useSpace();
  const [membersRefreshKey, setMembersRefreshKey] = useState(0);

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

      <AccountSection email={currentUserEmail} />
      <DisplayNameSection
        currentUserEmail={currentUserEmail}
        onDisplayNameSaved={() => setMembersRefreshKey((key) => key + 1)}
      />
      <CurrentSpaceSection currentSpace={currentSpace} />
      <ManagementSection />
      <MembersSection currentSpaceId={currentSpaceId} refreshKey={membersRefreshKey} />
      <InviteSection
        currentSpaceId={currentSpaceId}
        currentSpaceRole={currentSpace?.role ?? null}
      />

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

function ManagementSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>관리</Text>
      <View style={styles.managementActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="완료 이력"
          onPress={() => router.push('/history')}
          style={({ pressed }) => [
            styles.managementButton,
            pressed && styles.managementButtonPressed,
          ]}
        >
          <Text style={styles.managementButtonTitle}>완료 이력</Text>
          <Text style={styles.managementButtonDescription}>스페이스의 완료 기록을 확인해요.</Text>
        </Pressable>
      </View>
    </View>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 12,
  },
  managementActions: {
    gap: 8,
  },
  managementButton: {
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#F7F7F4',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 3,
  },
  managementButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  managementButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2520',
  },
  managementButtonDescription: {
    fontSize: 13,
    color: '#77776B',
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
