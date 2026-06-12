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
        user_id
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
      profiles (
        id,
        display_name
      )
    `,
    )
    .eq('space_id', spaceId)
    .order('joined_at', { ascending: true });

type SpaceMembersQueryData = QueryData<ReturnType<typeof spaceMembersQuery>>;

export interface MySpace {
  id: string;
  name: string;
}

export interface SpaceMember {
  id: string;
  userId: string;
  displayName: string;
  joinedAt: string;
}

export async function getMySpaces(userId: string): Promise<MySpace[]> {
  const result = await mySpacesQuery(userId);

  if (result.error) {
    throw result.error;
  }

  const rows: MySpacesQueryData = result.data ?? [];

  return rows.map((space) => ({
    id: space.id,
    name: space.name,
  }));
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
  }));
}
