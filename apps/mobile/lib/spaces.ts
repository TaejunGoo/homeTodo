import type { QueryData } from '@supabase/supabase-js';

import { supabase } from './supabase';

const mySpacesQuery = (userId: string) =>
  supabase
    .from('spaces')
    .select(
      `
      id,
      name,
      space_members!inner (
        user_id,
        role
      )
    `,
    )
    .eq('space_members.user_id', userId);

type MySpacesQueryData = QueryData<ReturnType<typeof mySpacesQuery>>;

const spaceMembersQuery = (spaceId: string) =>
  supabase
    .from('space_members')
    .select(
      `
      id,
      user_id,
      joined_at,
      role,
      profiles (
        id,
        display_name
      )
    `,
    )
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true });

type SpaceMembersQueryData = QueryData<ReturnType<typeof spaceMembersQuery>>;

export type SpaceRole = 'owner' | 'admin' | 'member';

export interface MySpace {
  id: string;
  name: string;
  role: SpaceRole;
}

export interface SpaceMember {
  id: string;
  userId: string;
  displayName: string;
  joinedAt: string;
  role: SpaceRole;
}

export async function getMySpaces(userId: string): Promise<MySpace[]> {
  const result = await mySpacesQuery(userId);

  if (result.error) {
    throw result.error;
  }

  const rows: MySpacesQueryData = result.data ?? [];

  return rows.map((space) => {
    const membership = space.space_members[0];

    return {
      id: space.id,
      name: space.name,
      role: normalizeSpaceRole(membership?.role),
    };
  });
}

export async function createSpace(name: string): Promise<MySpace> {
  const result = await supabase.rpc('create_space', { space_name: name }).single();

  if (result.error) {
    throw result.error;
  }

  const space = result.data;

  return {
    id: space.id,
    name: space.name,
    role: 'owner',
  };
}

export async function getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
  const result = await spaceMembersQuery(spaceId);

  if (result.error) {
    throw result.error;
  }

  const rows: SpaceMembersQueryData = result.data ?? [];

  return rows.map((member) => ({
    id: member.id,
    userId: member.user_id,
    displayName: member.profiles?.display_name ?? '이름 없음',
    joinedAt: member.joined_at,
    role: normalizeSpaceRole(member.role),
  }));
}

export function getSpaceRoleLabel(role: SpaceRole) {
  switch (role) {
    case 'owner':
      return '소유자';
    case 'admin':
      return '관리자';
    case 'member':
      return '멤버';
  }
}

export function canCreateSpaceInvite(role: SpaceRole | null | undefined) {
  return role === 'owner' || role === 'admin';
}

function normalizeSpaceRole(role: string | null | undefined): SpaceRole {
  if (role === 'owner' || role === 'admin' || role === 'member') {
    return role;
  }

  return 'member';
}
