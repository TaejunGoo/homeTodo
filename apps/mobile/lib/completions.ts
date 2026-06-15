import { supabase } from './supabase';

interface CompleteChoreOccurrenceInput {
  choreId: string;
  spaceId: string;
  targetPeriodStart: string;
}

export type ChoreCompletionEventType = 'completed' | 'uncompleted';

export interface ChoreCompletionHistoryItem {
  id: string;
  choreId: string;
  choreTitle: string;
  actorId: string;
  actorName: string;
  eventType: ChoreCompletionEventType;
  targetPeriodStart: string;
  createdAt: string;
}

export interface ChoreCompletionHistoryPage {
  items: ChoreCompletionHistoryItem[];
  hasMore: boolean;
}

interface GetChoreCompletionHistoryOptions {
  choreId?: string;
  offset?: number;
  limit?: number;
}

interface ChoreCompletionEventRow {
  id: string;
  chore_id: string;
  actor_id: string;
  event_type: string;
  target_period_start: string;
  created_at: string;
  chores: {
    title: string;
  } | null;
  profiles: {
    display_name: string;
  } | null;
}

export async function completeChoreOccurrence(
  input: CompleteChoreOccurrenceInput,
): Promise<{ created: boolean }> {
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  if (userResult.error || !user) {
    throw userResult.error ?? new Error('Authentication required.');
  }

  const completionResult = await supabase
    .from('chore_completions')
    .insert({
      chore_id: input.choreId,
      space_id: input.spaceId,
      completed_by: user.id,
      target_period_start: input.targetPeriodStart,
    })
    .select('id')
    .single();

  if (completionResult.error) {
    if (completionResult.error.code === '23505') {
      return { created: false };
    }

    throw completionResult.error;
  }

  const eventResult = await supabase.from('chore_completion_events').insert({
    chore_id: input.choreId,
    space_id: input.spaceId,
    target_period_start: input.targetPeriodStart,
    event_type: 'completed',
    actor_id: user.id,
  });

  if (eventResult.error) {
    throw eventResult.error;
  }

  return { created: true };
}

export async function uncompleteChoreOccurrence(
  input: CompleteChoreOccurrenceInput,
): Promise<void> {
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  if (userResult.error || !user) {
    throw userResult.error ?? new Error('Authentication required.');
  }

  const deleteResult = await supabase
    .from('chore_completions')
    .delete()
    .eq('chore_id', input.choreId)
    .eq('space_id', input.spaceId)
    .eq('target_period_start', input.targetPeriodStart);

  if (deleteResult.error) {
    throw deleteResult.error;
  }

  const eventResult = await supabase.from('chore_completion_events').insert({
    chore_id: input.choreId,
    space_id: input.spaceId,
    target_period_start: input.targetPeriodStart,
    event_type: 'uncompleted',
    actor_id: user.id,
  });

  if (eventResult.error) {
    throw eventResult.error;
  }
}

export async function getChoreCompletionHistory(
  spaceId: string,
  options: GetChoreCompletionHistoryOptions = {},
): Promise<ChoreCompletionHistoryPage> {
  const offset = options.offset ?? 0;
  const limit = options.limit ?? 20;

  let query = supabase
    .from('chore_completion_events')
    .select(
      `
      id,
      chore_id,
      actor_id,
      event_type,
      target_period_start,
      created_at,
      chores!chore_completion_events_chore_id_fkey (
        title
      ),
      profiles!chore_completion_events_actor_id_fkey (
        display_name
      )
    `,
    )
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });

  if (options.choreId) {
    query = query.eq('chore_id', options.choreId);
  }

  const result = await query.range(offset, offset + limit);

  if (result.error) {
    throw result.error;
  }

  const rows = (result.data ?? []) as ChoreCompletionEventRow[];
  const visibleRows = rows.slice(0, limit);

  return {
    items: visibleRows.map((event) => ({
      id: event.id,
      choreId: event.chore_id,
      choreTitle: event.chores?.title ?? '알 수 없는 TODO',
      actorId: event.actor_id,
      actorName: event.profiles?.display_name ?? '이름 없음',
      eventType: normalizeCompletionEventType(event.event_type),
      targetPeriodStart: event.target_period_start,
      createdAt: event.created_at,
    })),
    hasMore: rows.length > limit,
  };
}

function normalizeCompletionEventType(eventType: string): ChoreCompletionEventType {
  if (eventType === 'completed' || eventType === 'uncompleted') {
    return eventType;
  }

  return 'completed';
}
