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
          sectionPeriodLabel={section.periodLabel}
          occurrence={occurrence}
          onOpenMenu={onOpenMenu}
          onPressOccurrence={onPressOccurrence}
        />
      ))}
    </View>
  );
}

function OccurrenceListItem({
  sectionPeriodLabel,
  occurrence,
  onOpenMenu,
  onPressOccurrence,
}: {
  sectionPeriodLabel: string | null;
  occurrence: ChoreOccurrence;
  onOpenMenu: (occurrence: ChoreOccurrence) => void;
  onPressOccurrence: (occurrence: ChoreOccurrence) => void;
}) {
  return (
    <ChoreListItem
      title={occurrence.chore.title}
      meta={getOccurrenceMeta(occurrence, sectionPeriodLabel)}
      completed={occurrence.isCompleted}
      recentCompletionStatuses={occurrence.recentCompletionStatuses}
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

function getOccurrenceMeta(occurrence: ChoreOccurrence, sectionPeriodLabel: string | null) {
  if (occurrence.recurrenceType !== 'interval_days') {
    return undefined;
  }

  return sectionPeriodLabel === null ? occurrence.periodLabel : undefined;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
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
