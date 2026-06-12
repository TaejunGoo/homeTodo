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

export interface MySpace {
  id: string;
  name: string;
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
