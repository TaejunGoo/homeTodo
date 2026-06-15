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

  if (totalCount === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.periodLabel ? <Text style={styles.sectionPeriod}>{section.periodLabel}</Text> : null}
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
  const metaItems: string[] = [];

  if (occurrence.recurrenceType !== 'interval_days') {
    return getPreviousCompletionMeta(occurrence);
  }

  metaItems.push(`${occurrence.chore.recurrenceValue ?? '-'}일마다`);
  metaItems.push(occurrence.periodLabel);

  const previousCompletionMeta = getPreviousCompletionMeta(occurrence);

  if (previousCompletionMeta) {
    metaItems.push(previousCompletionMeta);
  }

  return metaItems.join(' · ');
}

function getPreviousCompletionMeta(occurrence: ChoreOccurrence) {
  if (occurrence.wasPreviousCompleted === null) {
    return undefined;
  }

  return occurrence.wasPreviousCompleted ? '지난번 완료' : '지난번 미완료';
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
  },
  sectionPeriod: {
    fontSize: 13,
    fontWeight: '500',
    color: '#77776B',
    flexShrink: 0,
  },
});
