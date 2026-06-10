import { ScreenHeading } from '@/components/screen-heading';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const spaces = [
  { id: 'space-home', name: '우리집', memberCount: 2, selected: true },
  { id: 'space-studio', name: '자취방', memberCount: 1, selected: false },
];

export default function SelectSpaceScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeading
          title="스페이스 선택"
          description="함께 관리할 집안일 공간을 선택해요."
          showBackButton
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참여 중인 스페이스</Text>

          {spaces.map((space) => (
            <Pressable
              key={space.id}
              accessibilityRole="button"
              accessibilityState={{ selected: space.selected }}
              style={({ pressed }) => [
                styles.spaceItem,
                space.selected && styles.spaceItemSelected,
                pressed && styles.spaceItemPressed,
              ]}
            >
              <View style={styles.spaceTextGroup}>
                <Text style={styles.spaceName}>{space.name}</Text>
                <Text style={styles.spaceMeta}>{space.memberCount}명 참여 중</Text>
              </View>

              {space.selected && <Text style={styles.selectedMark}>✓</Text>}
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="새 스페이스 만들기"
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>새 스페이스 만들기</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="초대 코드로 참여"
            onPress={() => router.push('/join-invite')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>초대 코드로 참여</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  content: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  spaceItem: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spaceItemSelected: {
    borderColor: '#2F6F67',
    backgroundColor: '#F0F7F4',
  },
  spaceItemPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  spaceTextGroup: {
    flex: 1,
    gap: 2,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2520',
  },
  spaceMeta: {
    fontSize: 13,
    color: '#77776B',
  },
  selectedMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F6F67',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  primaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#2F6F67',
  },
});
