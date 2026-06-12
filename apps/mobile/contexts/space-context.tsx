import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMySpaces, type MySpace } from '@/lib/spaces';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const CURRENT_SPACE_ID_STORAGE_KEY_PREFIX = 'homeTodo.currentSpaceId';

interface SpaceContextValue {
  currentUserEmail: string;
  spaces: MySpace[];
  currentSpace: MySpace | null;
  currentSpaceId: string | null;
  isLoading: boolean;
  errorMessage: string;
  selectSpace: (spaceId: string) => void;
  refreshSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextValue | null>(null);

interface SpaceProviderProps {
  children: ReactNode;
}

export function SpaceProvider({ children }: SpaceProviderProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [spaces, setSpaces] = useState<MySpace[]>([]);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const clearSpaceState = useCallback(() => {
    setCurrentUserId(null);
    setCurrentUserEmail('');
    setSpaces([]);
    setCurrentSpaceId(null);
    setErrorMessage('');
    setIsLoading(false);
  }, []);

  const refreshSpacesForUser = useCallback(async (user: User) => {
    setIsLoading(true);
    setErrorMessage('');
    setCurrentUserId(user.id);
    setCurrentUserEmail(user.email ?? '');

    try {
      const nextSpaces = await getMySpaces(user.id);
      const storedSpaceId = await AsyncStorage.getItem(getCurrentSpaceIdStorageKey(user.id));

      setSpaces(nextSpaces);

      // Keep the current selection if it is still valid. Otherwise restore the
      // last saved selection, then fall back to the first accessible space.
      setCurrentSpaceId((selectedSpaceId) => {
        const nextSpaceId = selectedSpaceId ?? storedSpaceId;

        if (nextSpaceId && nextSpaces.some((space) => space.id === nextSpaceId)) {
          return nextSpaceId;
        }

        return nextSpaces[0]?.id ?? null;
      });
    } catch {
      setSpaces([]);
      setCurrentSpaceId(null);
      setErrorMessage('스페이스 목록을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSpaces = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    const userResult = await supabase.auth.getUser();

    if (userResult.error || !userResult.data.user) {
      clearSpaceState();
      return;
    }

    await refreshSpacesForUser(userResult.data.user);
  }, [clearSpaceState, refreshSpacesForUser]);

  useEffect(() => {
    refreshSpaces();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;

      if (!user) {
        clearSpaceState();
        return;
      }

      refreshSpacesForUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearSpaceState, refreshSpaces, refreshSpacesForUser]);

  const currentSpace = spaces.find((space) => space.id === currentSpaceId) ?? null;

  const selectSpace = useCallback(
    (spaceId: string) => {
      const canSelectSpace = spaces.some((space) => space.id === spaceId);

      if (!currentUserId || !canSelectSpace) {
        return;
      }

      setCurrentSpaceId(spaceId);

      // This is a user preference cache. The in-memory state should update even if
      // persisting the last selected space fails.
      AsyncStorage.setItem(getCurrentSpaceIdStorageKey(currentUserId), spaceId).catch(() => {});
    },
    [currentUserId, spaces],
  );

  const value = useMemo(
    () => ({
      currentUserEmail,
      spaces,
      currentSpace,
      currentSpaceId,
      isLoading,
      errorMessage,
      selectSpace,
      refreshSpaces,
    }),
    [
      currentUserEmail,
      spaces,
      currentSpace,
      currentSpaceId,
      isLoading,
      errorMessage,
      selectSpace,
      refreshSpaces,
    ],
  );

  return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>;
}

export function useSpace() {
  const context = useContext(SpaceContext);

  if (!context) {
    throw new Error('useSpace must be used within SpaceProvider.');
  }

  return context;
}

function getCurrentSpaceIdStorageKey(userId: string) {
  return `${CURRENT_SPACE_ID_STORAGE_KEY_PREFIX}.${userId}`;
}
