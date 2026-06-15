import { ChoreListItem } from '@/components/chore-list-item';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useSpace } from '@/contexts/space-context';
import { getActiveChores, recurrenceSections, type Chore } from '@/lib/chores';
import { getProfilesByIds } from '@/lib/profiles';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TodosScreen() {
  const insets = useSafeAreaInsets();
  const { currentSpaceId } = useSpace();
  const [chores, setChores] = useState<Chore[]>([]);
  const [creatorNameMap, setCreatorNameMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadChores = useCallback(async () => {
    if (!currentSpaceId) {
      setChores([]);
      setCreatorNameMap({});
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextChores = await getActiveChores(currentSpaceId);
      const profiles = await getProfilesByIds(nextChores.map((chore) => chore.createdBy));

      setChores(nextChores);
      setCreatorNameMap(
        Object.fromEntries(profiles.map((profile) => [profile.id, profile.displayName])),
      );
    } catch {
      setChores([]);
      setCreatorNameMap({});
      setErrorMessage('TODO 목록을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSpaceId]);

  useFocusEffect(
    useCallback(() => {
      loadChores();
    }, [loadChores]),
  );

  const sections = useMemo(
    () =>
      recurrenceSections.map((section) => ({
        ...section,
        chores: chores.filter((chore) => chore.recurrenceType === section.type),
      })),
    [chores],
  );

  const hasNoChores = !isLoading && !errorMessage && chores.length === 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>전체 TODO</Text>
          <Text style={styles.description}>활성화된 집안일을 반복 주기별로 확인해요.</Text>
        </View>

        {isLoading ? <LoadingState message="TODO 목록을 불러오는 중이에요." /> : null}

        {!isLoading && errorMessage ? (
          <ErrorState message={errorMessage} actionLabel="다시 시도" onActionPress={loadChores} />
        ) : null}

        {hasNoChores ? (
          <EmptyState
            title="등록된 TODO가 없어요"
            description="TODO 만들기 버튼으로 첫 집안일을 추가해요."
          />
        ) : null}

        {!isLoading && !errorMessage && chores.length > 0
          ? sections.map((section) => (
              <ChoreSection
                key={section.type}
                title={section.title}
                chores={section.chores}
                creatorNameMap={creatorNameMap}
              />
            ))
          : null}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="TODO 만들기"
        onPress={() => router.push('/create-todo')}
        style={({ pressed }) => [
          styles.floatingButton,
          { bottom: insets.bottom + 24 },
          pressed && styles.floatingButtonPressed,
        ]}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

interface ChoreSectionProps {
  title: string;
  chores: Chore[];
  creatorNameMap: Record<string, string>;
}

function ChoreSection({ title, chores, creatorNameMap }: ChoreSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {chores.length === 0 ? (
        <EmptyState
          title="등록된 TODO가 없어요"
          description={`${title} 반복으로 등록된 집안일이 아직 없어요.`}
        />
      ) : (
        chores.map((chore) => (
          <ChoreListItem
            key={chore.id}
            title={chore.title}
            meta={getChoreMeta(chore, creatorNameMap[chore.createdBy])}
            onPress={() => {
              router.push(`/edit-todo/${chore.id}`);
            }}
            onMenuPress={() => {
              router.push(`/edit-todo/${chore.id}`);
            }}
          />
        ))
      )}
    </View>
  );
}

function getChoreMeta(chore: Chore, creatorName?: string) {
  return `등록일 ${formatDate(chore.createdAt)} · 등록자 ${creatorName ?? '이름 없음'}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#77776B',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  floatingButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  floatingButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 36,
  },
});
