import { getActiveChores, recurrenceSections, type Chore, type RecurrenceType } from './chores';
import { supabase } from './supabase';

export interface ChoreOccurrence {
  chore: Chore;
  recurrenceType: RecurrenceType;
  targetPeriodStart: string;
  previousTargetPeriodStart: string | null;
  recentTargetPeriodStarts: string[];
  recentCompletionStatuses: boolean[];
  periodLabel: string;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null;
  wasPreviousCompleted: boolean | null;
}

export interface ChoreOccurrenceSection {
  id: string;
  title: string;
  type: RecurrenceType;
  periodLabel: string | null;
  occurrences: ChoreOccurrence[];
}

interface ChoreCompletionRow {
  chore_id: string;
  target_period_start: string;
  completed_at: string;
  completed_by: string;
}

export async function getCurrentChoreOccurrenceSections(
  spaceId: string,
  today = new Date(),
): Promise<ChoreOccurrenceSection[]> {
  const chores = await getActiveChores(spaceId);
  const occurrences = chores
    .map((chore) => buildCurrentOccurrence(chore, today))
    .filter((occurrence): occurrence is ChoreOccurrence => occurrence !== null);

  if (occurrences.length === 0) {
    return buildSections(occurrences);
  }

  const completions = await getMatchingCompletions(spaceId, occurrences);
  const completionMap = new Map(
    completions.map((completion) => [getCompletionKey(completion.chore_id, completion.target_period_start), completion]),
  );

  const occurrencesWithCompletion = occurrences.map((occurrence) => {
    const completion = completionMap.get(
      getCompletionKey(occurrence.chore.id, occurrence.targetPeriodStart),
    );
    const recentCompletionStatuses = occurrence.recentTargetPeriodStarts.map((periodStart) =>
      completionMap.has(getCompletionKey(occurrence.chore.id, periodStart)),
    );

    return {
      ...occurrence,
      isCompleted: Boolean(completion),
      completedAt: completion?.completed_at ?? null,
      completedBy: completion?.completed_by ?? null,
      wasPreviousCompleted: occurrence.previousTargetPeriodStart
        ? recentCompletionStatuses[1] ?? false
        : null,
      recentCompletionStatuses,
    };
  });

  return buildSections(occurrencesWithCompletion);
}

export function getTargetPeriodStart(chore: Chore, today = new Date()): string | null {
  const todayDate = startOfDay(today);
  const startDate = parseDateKey(chore.startDate);

  if (todayDate < startDate) {
    return null;
  }

  switch (chore.recurrenceType) {
    case 'daily':
      return formatDateKey(todayDate);
    case 'weekly':
      return formatDateKey(startOfIsoWeek(todayDate));
    case 'monthly':
      return formatDateKey(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
    case 'interval_days':
      return getIntervalPeriodStart(startDate, todayDate, chore.recurrenceValue ?? 1);
  }
}

function buildCurrentOccurrence(chore: Chore, today: Date): ChoreOccurrence | null {
  const targetPeriodStart = getTargetPeriodStart(chore, today);

  if (!targetPeriodStart) {
    return null;
  }

  const previousTargetPeriodStart = getPreviousTargetPeriodStart(chore, targetPeriodStart);
  const recentTargetPeriodStarts = getRecentTargetPeriodStarts(chore, targetPeriodStart, 3);

  return {
    chore,
    recurrenceType: chore.recurrenceType,
    targetPeriodStart,
    previousTargetPeriodStart,
    recentTargetPeriodStarts,
    recentCompletionStatuses: recentTargetPeriodStarts.map(() => false),
    periodLabel: getChorePeriodLabel(chore, targetPeriodStart),
    isCompleted: false,
    completedAt: null,
    completedBy: null,
    wasPreviousCompleted: null,
  };
}

async function getMatchingCompletions(
  spaceId: string,
  occurrences: ChoreOccurrence[],
): Promise<ChoreCompletionRow[]> {
  const periodStarts = [
    ...new Set(
      occurrences.flatMap((occurrence) => occurrence.recentTargetPeriodStarts),
    ),
  ];

  const result = await supabase
    .from('chore_completions')
    .select('chore_id, target_period_start, completed_at, completed_by')
    .eq('space_id', spaceId)
    .in('target_period_start', periodStarts);

  if (result.error) {
    throw result.error;
  }

  const occurrenceKeys = new Set(
    occurrences.flatMap((occurrence) =>
      occurrence.recentTargetPeriodStarts.map((periodStart) =>
        getCompletionKey(occurrence.chore.id, periodStart),
      ),
    ),
  );

  return (result.data ?? []).filter((completion) =>
    occurrenceKeys.has(getCompletionKey(completion.chore_id, completion.target_period_start)),
  );
}

function buildSections(occurrences: ChoreOccurrence[]): ChoreOccurrenceSection[] {
  return recurrenceSections.flatMap((section) => {
    if (section.type === 'interval_days') {
      return buildIntervalSections(occurrences);
    }

    const sectionOccurrences = getSectionOccurrences(occurrences, section.type);

    return {
      id: section.type,
      ...section,
      periodLabel: getSectionPeriodLabel(sectionOccurrences),
      occurrences: sectionOccurrences,
    };
  });
}

function buildIntervalSections(occurrences: ChoreOccurrence[]): ChoreOccurrenceSection[] {
  const intervalGroups = new Map<number, ChoreOccurrence[]>();

  for (const occurrence of occurrences) {
    if (occurrence.recurrenceType !== 'interval_days') {
      continue;
    }

    const intervalDays = occurrence.chore.recurrenceValue ?? 1;
    const groupOccurrences = intervalGroups.get(intervalDays) ?? [];

    groupOccurrences.push(occurrence);
    intervalGroups.set(intervalDays, groupOccurrences);
  }

  return [...intervalGroups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([intervalDays, groupOccurrences]) => {
      const sectionOccurrences = [...groupOccurrences].sort(compareOccurrences);

      return {
        id: `interval_days:${intervalDays}`,
        title: `${intervalDays}일마다`,
        type: 'interval_days',
        periodLabel: getSectionPeriodLabel(sectionOccurrences),
        occurrences: sectionOccurrences,
      };
    });
}

function getSectionOccurrences(occurrences: ChoreOccurrence[], type: RecurrenceType) {
  return occurrences
    .filter((occurrence) => occurrence.recurrenceType === type)
    .sort(compareOccurrences);
}

function compareOccurrences(a: ChoreOccurrence, b: ChoreOccurrence) {
  if (a.isCompleted !== b.isCompleted) {
    return a.isCompleted ? 1 : -1;
  }

  return a.chore.createdAt.localeCompare(b.chore.createdAt);
}

function getCompletionKey(choreId: string, targetPeriodStart: string) {
  return `${choreId}:${targetPeriodStart}`;
}

function getIntervalPeriodStart(startDate: Date, today: Date, intervalDays: number) {
  const diffDays = getDiffDays(startDate, today);
  const elapsedIntervals = Math.floor(diffDays / intervalDays);
  const periodStart = addDays(startDate, elapsedIntervals * intervalDays);

  return formatDateKey(periodStart);
}

export function getChorePeriodLabel(chore: Chore, targetPeriodStart: string) {
  const startDate = parseDateKey(targetPeriodStart);

  switch (chore.recurrenceType) {
    case 'daily':
      return formatFullDate(startDate);
    case 'weekly':
      return formatDateRange(startDate, addDays(startDate, 6));
    case 'monthly':
      return `${startDate.getFullYear()}.${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    case 'interval_days':
      return formatDateRange(startDate, addDays(startDate, (chore.recurrenceValue ?? 1) - 1));
  }
}

function getSectionPeriodLabel(occurrences: ChoreOccurrence[]) {
  const periodLabels = [...new Set(occurrences.map((occurrence) => occurrence.periodLabel))];

  if (periodLabels.length === 1) {
    return periodLabels[0];
  }

  return null;
}

function getPreviousTargetPeriodStart(chore: Chore, targetPeriodStart: string) {
  const currentPeriodStart = parseDateKey(targetPeriodStart);
  const startDate = parseDateKey(chore.startDate);
  let previousPeriodStart: Date;

  switch (chore.recurrenceType) {
    case 'daily':
      previousPeriodStart = addDays(currentPeriodStart, -1);
      break;
    case 'weekly':
      previousPeriodStart = addDays(currentPeriodStart, -7);
      break;
    case 'monthly':
      previousPeriodStart = new Date(
        currentPeriodStart.getFullYear(),
        currentPeriodStart.getMonth() - 1,
        1,
      );
      break;
    case 'interval_days':
      previousPeriodStart = addDays(currentPeriodStart, -(chore.recurrenceValue ?? 1));
      break;
  }

  if (previousPeriodStart < startDate) {
    return null;
  }

  return formatDateKey(previousPeriodStart);
}

function getRecentTargetPeriodStarts(chore: Chore, targetPeriodStart: string, count: number) {
  const periodStarts = [targetPeriodStart];
  let currentPeriodStart: string | null = targetPeriodStart;

  while (periodStarts.length < count && currentPeriodStart) {
    currentPeriodStart = getPreviousTargetPeriodStart(chore, currentPeriodStart);

    if (currentPeriodStart) {
      periodStarts.push(currentPeriodStart);
    }
  }

  return periodStarts;
}

function startOfIsoWeek(date: Date) {
  const normalized = startOfDay(date);
  const day = normalized.getDay();
  const diffFromMonday = day === 0 ? 6 : day - 1;

  return addDays(normalized, -diffFromMonday);
}

function getDiffDays(startDate: Date, endDate: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatFullDate(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function formatShortDate(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(
    2,
    '0',
  )}`;
}

function formatDateRange(startDate: Date, endDate: Date) {
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${formatFullDate(startDate)} - ${formatShortDate(endDate)}`;
  }

  return `${formatFullDate(startDate)} - ${formatFullDate(endDate)}`;
}
