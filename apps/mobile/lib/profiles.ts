import { supabase } from './supabase';

export interface MyProfile {
  id: string;
  displayName: string;
}

export interface ProfileSummary {
  id: string;
  displayName: string;
}

export async function getMyProfile(): Promise<MyProfile> {
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  if (userResult.error || !user) {
    throw userResult.error ?? new Error('No authenticated user.');
  }

  const result = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', user.id)
    .single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    displayName: result.data.display_name,
  };
}

export async function updateMyDisplayName(displayName: string): Promise<MyProfile> {
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  if (userResult.error || !user) {
    throw userResult.error ?? new Error('No authenticated user.');
  }

  const result = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', user.id)
    .select('id, display_name')
    .single();

  if (result.error) {
    throw result.error;
  }

  return {
    id: result.data.id,
    displayName: result.data.display_name,
  };
}

export async function getProfilesByIds(profileIds: string[]): Promise<ProfileSummary[]> {
  const uniqueProfileIds = [...new Set(profileIds)];

  if (uniqueProfileIds.length === 0) {
    return [];
  }

  const result = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('id', uniqueProfileIds);

  if (result.error) {
    throw result.error;
  }

  return (result.data ?? []).map((profile) => ({
    id: profile.id,
    displayName: profile.display_name,
  }));
}
