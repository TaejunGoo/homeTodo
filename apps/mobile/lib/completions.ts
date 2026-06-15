import { supabase } from './supabase';

interface CompleteChoreOccurrenceInput {
  choreId: string;
  spaceId: string;
  targetPeriodStart: string;
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
