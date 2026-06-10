import { ScrollView, StyleSheet, Text, View } from 'react-native';

const completionGroups = [
  {
    date: '오늘',
    items: [
      {
        id: 'completion-recycling-today',
        title: '분리수거',
        completedBy: '태준',
        completedAt: '18:20',
      },
    ],
  },
  {
    date: '어제',
    items: [
      {
        id: 'completion-bathroom-yesterday',
        title: '화장실 청소',
        completedBy: '혜진',
        completedAt: '21:10',
      },
      {
        id: 'completion-sink-yesterday',
        title: '싱크대 정리',
        completedBy: '태준',
        completedAt: '09:40',
      },
    ],
  },
];

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>완료 이력</Text>
        <Text style={styles.description}>누가 어떤 집안일을 완료했는지 확인해요.</Text>
      </View>

      {completionGroups.map((group) => (
        <View key={group.date} style={styles.group}>
          <Text style={styles.groupTitle}>{group.date}</Text>

          {group.items.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyTextGroup}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyMeta}>
                  완료자: {item.completedBy} · {item.completedAt}
                </Text>
              </View>
            </View>
          ))}
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
  group: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  historyItem: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginBottom: 8,
  },
  historyTextGroup: {
    gap: 2,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2520',
  },
  historyMeta: {
    fontSize: 13,
    color: '#77776B',
  },
});
