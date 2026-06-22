import type { ChoreOccurrence, ChoreOccurrenceSection } from './chore-occurrences';

export function getOccurrenceKey(occurrence: ChoreOccurrence) {
  return `${occurrence.chore.id}:${occurrence.targetPeriodStart}`;
}

export function updateOccurrenceCompletion(
  sections: ChoreOccurrenceSection[],
  occurrenceKey: string,
  isCompleted: boolean,
) {
  return sections.map((section) => ({
    ...section,
    occurrences: section.occurrences.map((occurrence) => {
      if (getOccurrenceKey(occurrence) !== occurrenceKey) {
        return occurrence;
      }

      return {
        ...occurrence,
        isCompleted,
        recentCompletionStatuses: occurrence.recentCompletionStatuses.map((status, index) =>
          index === 0 ? isCompleted : status,
        ),
      };
    }),
  }));
}
