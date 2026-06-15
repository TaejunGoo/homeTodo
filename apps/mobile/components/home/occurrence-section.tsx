import { ChoreListItem } from '@/components/chore-list-item';
import type { ChoreOccurrence, ChoreOccurrenceSection } from '@/lib/chore-occurrences';
import { StyleSheet, Text, View } from 'react-native';

interface OccurrenceSectionProps {
  section: ChoreOccurrenceSection;
  onOpenMenu: (occurrence: ChoreOccurrence) => void;
  onPressOccurrence: (occurrence: ChoreOccurrence) => void;
}

export function OccurrenceSection({
  section,
  onOpenMenu,
  onPressOccurrence,
}: OccurrenceSectionProps) {
  const totalCount = section.occurrences.length;
  const completedCount = section.occurrences.filter((occurrence) => occurrence.isCompleted).length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.progress}>
          {completedCount}/{totalCount} 완료
        </Text>
      </View>

      {section.occurrences.map((occurrence) => (
        <OccurrenceListItem
          key={occurrence.chore.id}
          occurrence={occurrence}
          onOpenMenu={onOpenMenu}
          onPressOccurrence={onPressOccurrence}
        />
      ))}
    </View>
  );
}

function OccurrenceListItem({
  occurrence,
  onOpenMenu,
  onPressOccurrence,
}: {
  occurrence: ChoreOccurrence;
  onOpenMenu: (occurrence: ChoreOccurrence) => void;
  onPressOccurrence: (occurrence: ChoreOccurrence) => void;
}) {
  return (
    <ChoreListItem
      title={occurrence.chore.title}
      meta={getOccurrenceMeta(occurrence)}
      completed={occurrence.isCompleted}
      showCheckbox
      onPress={() => {
        onPressOccurrence(occurrence);
      }}
      onMenuPress={() => {
        onOpenMenu(occurrence);
      }}
    />
  );
}

function getOccurrenceMeta(occurrence: ChoreOccurrence) {
  if (occurrence.recurrenceType !== 'interval_days') {
    return undefined;
  }

  return `${occurrence.chore.recurrenceValue ?? '-'}일마다`;
}

const styles = StyleSheet.create({
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
});
