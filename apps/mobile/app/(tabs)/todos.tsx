import { ChoreListItem } from '@/components/chore-list-item';
import { EmptyState } from '@/components/empty-state';
import { LoadingState } from '@/components/loading-state';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const todoSections = [
  {
    title: '매일',
    chores: [
      { id: 'daily-recycling', title: '분리수거' },
      { id: 'daily-sink-cleanup', title: '싱크대 정리' },
    ],
  },
  {
    title: '매주',
    chores: [
      { id: 'weekly-bathroom-cleaning', title: '화장실 청소' },
      { id: 'weekly-bedding-laundry', title: '침구 세탁' },
    ],
  },
  {
    title: '매월',
    chores: [{ id: 'monthly-fridge-cleanup', title: '냉장고 정리' }],
  },
  {
    title: 'N일마다',
    chores: [],
  },
];

export default function TodosScreen() {
  const isLoading = false;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>전체 TODO</Text>
        <Text style={styles.description}>활성화된 집안일을 반복 주기별로 확인해요.</Text>
      </View>
      {isLoading && <LoadingState message="TODO 목록을 불러오는 중이에요." />}
      {todoSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>

          {section.chores.length === 0 ? (
            <EmptyState
              title="등록된 TODO가 없어요"
              description={`${section.title} 반복으로 등록된 집안일이 아직 없어요.`}
            />
          ) : (
            section.chores.map((chore) => (
              <ChoreListItem
                key={chore.id}
                title={chore.title}
                meta={`${section.title} 반복`}
                onPress={() => {
                  // 추후 상세/수정화면 이동
                }}
                onMenuPress={() => {
                  // 추후 바텀시트 오픈
                }}
              />
            ))
          )}
        </View>
      ))}
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
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
});
