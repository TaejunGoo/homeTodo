import { supabase } from './supabase';

export interface SpaceInvite {
  id: string;
  code: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
}

export async function createInviteCode(spaceId: string): Promise<SpaceInvite> {
  const result = await supabase.rpc('create_invite_code', { target_space_id: spaceId }).single();

  if (result.error) {
    throw result.error;
  }

  const invite = result.data;

  return {
    id: invite.id,
    code: invite.code,
    expiresAt: invite.expires_at,
    maxUses: invite.max_uses,
    usedCount: invite.used_count,
  };
}

export async function joinSpaceWithInviteCode(code: string) {
  const result = await supabase.rpc('join_space_with_invite_code', { invite_code: code }).single();

  if (result.error) {
    throw result.error;
  }

  return result.data;
}
