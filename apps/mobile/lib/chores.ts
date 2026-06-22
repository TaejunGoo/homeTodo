import { supabase } from './supabase';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'interval_days';

export interface Chore {
  id: string;
  spaceId: string;
  title: string;
  description: string | null;
  recurrenceType: RecurrenceType;
  recurrenceValue: number | null;
  startDate: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateChoreInput {
  spaceId: string;
  title: string;
  recurrenceType: RecurrenceType;
  recurrenceValue: number | null;
  startDate: string;
}

interface UpdateChoreInput {
  id: string;
  title: string;
  recurrenceType: RecurrenceType;
  recurrenceValue: number | null;
}

interface NormalizedRecurrenceInput {
  recurrenceType: RecurrenceType;
  recurrenceValue: number | null;
}

export const recurrenceSections: { title: string; type: RecurrenceType }[] = [
  { title: '매일', type: 'daily' },
  { title: '매주', type: 'weekly' },
  { title: '매월', type: 'monthly' },
  { title: 'N일마다', type: 'interval_days' },
];

const choreSelectColumns = `
  id,
  space_id,
  title,
  description,
  recurrence_type,
  recurrence_value,
  start_date,
  is_active,
  created_by,
  created_at,
  updated_at
`;

export async function getActiveChores(spaceId: string): Promise<Chore[]> {
  const result = await supabase
    .from('chores')
    .select(choreSelectColumns)
    .eq('space_id', spaceId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []).map(mapChoreRow);
}

export async function getChore(choreId: string): Promise<Chore> {
  const result = await supabase
    .from('chores')
    .select(choreSelectColumns)
    .eq('id', choreId)
    .single();

  if (result.error) {
    throw result.error;
  }

  return mapChoreRow(result.data);
}

export async function createChore(input: CreateChoreInput): Promise<Chore> {
  const userResult = await supabase.auth.getUser();

  if (userResult.error || !userResult.data.user) {
    throw userResult.error ?? new Error('Authentication required.');
  }

  const result = await supabase
    .from('chores')
    .insert({
      space_id: input.spaceId,
      title: input.title,
      recurrence_type: input.recurrenceType,
      recurrence_value: input.recurrenceValue,
      start_date: input.startDate,
      created_by: userResult.data.user.id,
    })
    .select(choreSelectColumns)
    .single();

  if (result.error) {
    throw result.error;
  }

  return mapChoreRow(result.data);
}

export async function updateChore(input: UpdateChoreInput): Promise<Chore> {
  const result = await supabase
    .from('chores')
    .update({
      title: input.title,
      recurrence_type: input.recurrenceType,
      recurrence_value: input.recurrenceValue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.id)
    .select(choreSelectColumns)
    .single();

  if (result.error) {
    throw result.error;
  }

  return mapChoreRow(result.data);
}

export async function deactivateChore(choreId: string): Promise<void> {
  const result = await supabase
    .from('chores')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', choreId);

  if (result.error) {
    throw result.error;
  }
}

export function getRecurrenceLabel(chore: Pick<Chore, 'recurrenceType' | 'recurrenceValue'>) {
  switch (chore.recurrenceType) {
    case 'daily':
      return '매일 반복';
    case 'weekly':
      return '매주 반복';
    case 'monthly':
      return '매월 반복';
    case 'interval_days':
      return `${chore.recurrenceValue ?? '-'}일마다 반복`;
  }
}

export function normalizeRecurrenceInput(
  recurrenceType: RecurrenceType,
  recurrenceValue: number | null,
): NormalizedRecurrenceInput {
  if (recurrenceType !== 'interval_days') {
    return {
      recurrenceType,
      recurrenceValue: null,
    };
  }

  if (recurrenceValue === 1) {
    return {
      recurrenceType: 'daily',
      recurrenceValue: null,
    };
  }

  return {
    recurrenceType,
    recurrenceValue,
  };
}

function mapChoreRow(row: {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  recurrence_value: number | null;
  start_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}): Chore {
  return {
    id: row.id,
    spaceId: row.space_id,
    title: row.title,
    description: row.description,
    recurrenceType: normalizeRecurrenceType(row.recurrence_type),
    recurrenceValue: row.recurrence_value,
    startDate: row.start_date,
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeRecurrenceType(value: string): RecurrenceType {
  if (value === 'daily' || value === 'weekly' || value === 'monthly' || value === 'interval_days') {
    return value;
  }

  return 'daily';
}
