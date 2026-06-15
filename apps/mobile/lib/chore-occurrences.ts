import { getActiveChores, recurrenceSections, type Chore, type RecurrenceType } from './chores';
import { supabase } from './supabase';

export interface ChoreOccurrence {
  chore: Chore;
  recurrenceType: RecurrenceType;
  targetPeriodStart: string;
  isCompleted: boolean;
  completedAt: string | null;
  completedBy: string | null;
}

export interface ChoreOccurrenceSection {
  title: string;
  type: RecurrenceType;
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

    if (!completion) {
      return occurrence;
    }

    return {
      ...occurrence,
      isCompleted: true,
      completedAt: completion.completed_at,
      completedBy: completion.completed_by,
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

  return {
    chore,
    recurrenceType: chore.recurrenceType,
    targetPeriodStart,
    isCompleted: false,
    completedAt: null,
    completedBy: null,
  };
}

async function getMatchingCompletions(
  spaceId: string,
  occurrences: ChoreOccurrence[],
): Promise<ChoreCompletionRow[]> {
  const periodStarts = [...new Set(occurrences.map((occurrence) => occurrence.targetPeriodStart))];

  const result = await supabase
    .from('chore_completions')
    .select('chore_id, target_period_start, completed_at, completed_by')
    .eq('space_id', spaceId)
    .in('target_period_start', periodStarts);

  if (result.error) {
    throw result.error;
  }

  const occurrenceKeys = new Set(
    occurrences.map((occurrence) =>
      getCompletionKey(occurrence.chore.id, occurrence.targetPeriodStart),
    ),
  );

  return (result.data ?? []).filter((completion) =>
    occurrenceKeys.has(getCompletionKey(completion.chore_id, completion.target_period_start)),
  );
}

function buildSections(occurrences: ChoreOccurrence[]): ChoreOccurrenceSection[] {
  return recurrenceSections.map((section) => ({
    ...section,
    occurrences: occurrences
      .filter((occurrence) => occurrence.recurrenceType === section.type)
      .sort(compareOccurrences),
  }));
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
