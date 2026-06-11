import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMySpaces, type MySpace } from '@/lib/spaces';
import { supabase } from '@/lib/supabase';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const CURRENT_SPACE_ID_STORAGE_KEY = 'homeTodo.currentSpaceId';

interface SpaceContextValue {
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
  const [spaces, setSpaces] = useState<MySpace[]>([]);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  async function refreshSpaces() {
    setIsLoading(true);
    setErrorMessage('');

    const userResult = await supabase.auth.getUser();

    if (userResult.error || !userResult.data.user) {
      setSpaces([]);
      setCurrentSpaceId(null);
      setErrorMessage('로그인 정보를 확인하지 못했어요.');
      setIsLoading(false);
      return;
    }

    try {
      const nextSpaces = await getMySpaces(userResult.data.user.id);
      const storedSpaceId = await AsyncStorage.getItem(CURRENT_SPACE_ID_STORAGE_KEY);

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
  }

  useEffect(() => {
    refreshSpaces();
  }, []);

  const currentSpace = spaces.find((space) => space.id === currentSpaceId) ?? null;

  function selectSpace(spaceId: string) {
    setCurrentSpaceId(spaceId);

    // This is a user preference cache. The in-memory state should update even if
    // persisting the last selected space fails.
    AsyncStorage.setItem(CURRENT_SPACE_ID_STORAGE_KEY, spaceId).catch(() => {});
  }

  const value = useMemo(
    () => ({
      spaces,
      currentSpace,
      currentSpaceId,
      isLoading,
      errorMessage,
      selectSpace,
      refreshSpaces,
    }),
    [spaces, currentSpace, currentSpaceId, isLoading, errorMessage],
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
