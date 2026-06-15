import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { useSpace } from '@/contexts/space-context';
import { getChorePeriodLabel } from '@/lib/chore-occurrences';
import { getChore, getRecurrenceLabel, type Chore } from '@/lib/chores';
import {
  getChoreCompletionHistory,
  type ChoreCompletionHistoryItem,
} from '@/lib/completions';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HISTORY_PAGE_SIZE = 20;

interface CompletionHistoryGroup {
  dateLabel: string;
  items: ChoreCompletionHistoryItem[];
}

export default function ChoreHistoryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { currentSpaceId } = useSpace();
  const [chore, setChore] = useState<Chore | null>(null);
  const [items, setItems] = useState<ChoreCompletionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadMoreErrorMessage, setLoadMoreErrorMessage] = useState('');

  const loadHistory = useCallback(async () => {
    if (!id || !currentSpaceId) {
      setChore(null);
      setItems([]);
      setHasMore(false);
      setErrorMessage('TODO 이력을 찾지 못했어요.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setLoadMoreErrorMessage('');

    try {
      const [nextChore, page] = await Promise.all([
        getChore(id),
        getChoreCompletionHistory(currentSpaceId, {
          choreId: id,
          limit: HISTORY_PAGE_SIZE,
        }),
      ]);

      setChore(nextChore);
      setItems(page.items);
      setHasMore(page.hasMore);
    } catch {
      setChore(null);
      setItems([]);
      setHasMore(false);
      setErrorMessage('TODO 이력을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSpaceId, id]);

  const loadMoreHistory = useCallback(async () => {
    if (!id || !currentSpaceId || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreErrorMessage('');

    try {
      const page = await getChoreCompletionHistory(currentSpaceId, {
        choreId: id,
        offset: items.length,
        limit: HISTORY_PAGE_SIZE,
      });

      setItems((currentItems) => [...currentItems, ...page.items]);
      setHasMore(page.hasMore);
    } catch {
      setLoadMoreErrorMessage('이력을 더 불러오지 못했어요.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentSpaceId, hasMore, id, isLoading, isLoadingMore, items.length]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const groups = useMemo(() => groupHistoryItems(items), [items]);
  const hasNoHistory = !isLoading && !errorMessage && items.length === 0;

  function closeScreen() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
          onPress={closeScreen}
        >
          <Text style={styles.backText}>‹ 뒤로</Text>
        </Pressable>

        <Text style={styles.headerTitle}>TODO 이력</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View style={styles.summary}>
          <Text style={styles.title}>{chore?.title ?? 'TODO 이력'}</Text>
          {chore ? <Text style={styles.description}>{getRecurrenceLabel(chore)}</Text> : null}
        </View>

        {isLoading ? <LoadingState message="TODO 이력을 불러오는 중이에요." /> : null}

        {!isLoading && errorMessage ? (
          <ErrorState message={errorMessage} actionLabel="다시 시도" onActionPress={loadHistory} />
        ) : null}

        {hasNoHistory ? (
          <EmptyState
            title="아직 이력이 없어요"
            description="이 TODO를 완료하거나 완료 취소하면 이곳에 기록돼요."
          />
        ) : null}

        {!isLoading && !errorMessage
          ? groups.map((group) => (
              <View key={group.dateLabel} style={styles.group}>
                <Text style={styles.groupTitle}>{group.dateLabel}</Text>

                {group.items.map((item) => (
                  <HistoryItem key={item.id} chore={chore} item={item} />
                ))}
              </View>
            ))
          : null}

        {!isLoading && !errorMessage && items.length > 0 ? (
          <View style={styles.footer}>
            {loadMoreErrorMessage ? (
              <Text style={styles.loadMoreError}>{loadMoreErrorMessage}</Text>
            ) : null}

            {hasMore ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="TODO 이력 더 보기"
                disabled={isLoadingMore}
                onPress={loadMoreHistory}
                style={({ pressed }) => [
                  styles.loadMoreButton,
                  pressed && styles.loadMoreButtonPressed,
                  isLoadingMore && styles.loadMoreButtonDisabled,
                ]}
              >
                <Text style={styles.loadMoreButtonText}>
                  {isLoadingMore ? '불러오는 중...' : '더 보기'}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.endText}>모든 이력을 불러왔어요.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryItem({
  chore,
  item,
}: {
  chore: Chore | null;
  item: ChoreCompletionHistoryItem;
}) {
  const isCompletedEvent = item.eventType === 'completed';
  const periodLabel = chore
    ? getChorePeriodLabel(chore, item.targetPeriodStart)
    : formatDate(parseDateKey(item.targetPeriodStart));

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyTitleRow}>
        <Text style={styles.historyTitle}>{periodLabel}</Text>
        <Text style={[styles.eventBadge, !isCompletedEvent && styles.eventBadgeMuted]}>
          {isCompletedEvent ? '완료' : '완료 취소'}
        </Text>
      </View>
      <Text style={styles.historyMeta}>
        {item.actorName} · {formatTime(item.createdAt)}
      </Text>
    </View>
  );
}

function groupHistoryItems(items: ChoreCompletionHistoryItem[]): CompletionHistoryGroup[] {
  const groups: CompletionHistoryGroup[] = [];

  for (const item of items) {
    const dateLabel = formatDateLabel(item.createdAt);
    const group = groups.find((candidate) => candidate.dateLabel === dateLabel);

    if (group) {
      group.items.push(item);
      continue;
    }

    groups.push({
      dateLabel,
      items: [item],
    });
  }

  return groups;
}

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);
  const yesterday = addDays(today, -1);

  if (targetDate.getTime() === today.getTime()) {
    return '오늘';
  }

  if (targetDate.getTime() === yesterday.getTime()) {
    return '어제';
  }

  return formatDate(date);
}

function formatDate(date: Date) {
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 17,
    color: '#2F6F67',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
  },
  headerSpacer: {
    width: 52,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  summary: {
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
  group: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  historyItem: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    marginBottom: 8,
    gap: 4,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  historyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2520',
  },
  eventBadge: {
    borderRadius: 999,
    backgroundColor: '#E8F2E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#2F7D4A',
  },
  eventBadgeMuted: {
    backgroundColor: '#F2EEE8',
    color: '#77776B',
  },
  historyMeta: {
    fontSize: 13,
    color: '#77776B',
  },
  footer: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 8,
  },
  loadMoreButton: {
    minHeight: 42,
    minWidth: 112,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#D6D2C8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  loadMoreButtonDisabled: {
    opacity: 0.6,
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2520',
  },
  loadMoreError: {
    fontSize: 13,
    color: '#8F2F24',
  },
  endText: {
    fontSize: 13,
    color: '#77776B',
  },
});
