import { ChoreListItem } from '@/components/chore-list-item';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const sections = [
  {
    title: '매일',
    progress: '1/2 완료',
    chores: [
      { id: 'today-daily-recycling', title: '분리수거', done: true },
      { id: 'today-daily-sink-cleanup', title: '싱크대 정리', done: false },
    ],
  },
  {
    title: '매주',
    progress: '0/2 완료',
    chores: [
      { id: 'today-weekly-bathroom-cleaning', title: '화장실 청소', done: false },
      { id: 'today-weekly-bedding-laundry', title: '침구 세탁', done: false },
    ],
  },
  {
    title: '매월',
    progress: '0/1 완료',
    chores: [{ id: 'today-monthly-fridge-cleanup', title: '냉장고 정리', done: false }],
  },
  {
    title: 'N일마다',
    progress: '0/1 완료',
    chores: [{ id: 'today-interval-water-filter-check', title: '정수기 필터 확인', done: false }],
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="스페이스 선택"
            hitSlop={8}
            onPress={() => router.push('/select-space')}
            style={({ pressed }) => [styles.spaceSelector, pressed && styles.spaceSelectorPressed]}
          >
            <Text style={styles.spaceLabel}>현재 스페이스</Text>
            <Text style={styles.spaceName}>우리집</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="스페이스 만들기"
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          >
            <Text style={styles.headerButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>오늘 할 집안일</Text>
          <Text style={styles.summaryText}>현재 기간에 해야 할 일을 확인해요.</Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.progress}>{section.progress}</Text>
            </View>

            {section.chores.map((chore) => (
              <ChoreListItem
                key={chore.id}
                title={chore.title}
                completed={chore.done}
                showCheckbox
                onPress={() => {
                  // 추후 상세/수정화면 이동
                }}
                onMenuPress={() => {
                  // 추후 바텀시트 오픈
                }}
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="TODO 만들기"
        onPress={() => router.push('/create-todo')}
        style={({ pressed }) => [
          styles.floatingButton,
          { bottom: insets.bottom + 24 },
          pressed && styles.floatingButtonPressed,
        ]}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
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
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  spaceSelector: {
    flex: 1,
  },
  spaceSelectorPressed: {
    opacity: 0.72,
  },
  spaceLabel: {
    fontSize: 13,
    color: '#77776B',
    marginBottom: 4,
  },
  spaceName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2520',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2520',
  },
  headerButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  headerButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  summary: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: '#77776B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4E2DA',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
  },
  progress: {
    fontSize: 14,
    color: '#77776B',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  floatingButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  floatingButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
  },
});
