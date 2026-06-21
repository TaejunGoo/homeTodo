import { AppHeader } from '@/components/app-header';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { OccurrenceActionSheet } from '@/components/home/occurrence-action-sheet';
import { OccurrenceSection } from '@/components/home/occurrence-section';
import { UncompleteConfirmModal } from '@/components/home/uncomplete-confirm-modal';
import { LoadingState } from '@/components/loading-state';
import { useSpace } from '@/contexts/space-context';
import { useHomeOccurrences } from '@/hooks/use-home-occurrences';
import type { ChoreOccurrence } from '@/lib/chore-occurrences';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    currentSpace,
    currentSpaceId,
    isLoading: isSpaceLoading,
    refreshSpaces,
  } = useSpace();
  const {
    completedCount,
    completeOccurrence,
    completeSelectedOccurrence,
    editSelectedOccurrence,
    errorMessage,
    hasNoOccurrences,
    isLoading,
    loadOccurrences,
    sections,
    selectedOccurrence,
    setSelectedOccurrence,
    totalCount,
    uncompleteOccurrence,
    uncompleteSelectedOccurrence,
    viewSelectedOccurrenceHistory,
  } = useHomeOccurrences(currentSpaceId);
  const [confirmUncompleteOccurrence, setConfirmUncompleteOccurrence] =
    useState<ChoreOccurrence | null>(null);
  const hasNoCurrentSpace = !currentSpaceId && !isSpaceLoading;

  function handlePressOccurrence(occurrence: ChoreOccurrence) {
    if (occurrence.isCompleted) {
      setConfirmUncompleteOccurrence(occurrence);
      return;
    }

    completeOccurrence(occurrence);
  }

  function handleConfirmUncomplete() {
    if (!confirmUncompleteOccurrence) {
      return;
    }

    const occurrence = confirmUncompleteOccurrence;

    setConfirmUncompleteOccurrence(null);
    uncompleteOccurrence(occurrence);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        onPressSettings={() => router.push('/settings')}
        onPressSpace={() => router.push('/select-space')}
        spaceName={currentSpace?.name ?? (isSpaceLoading ? '불러오는 중' : '스페이스 없음')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {currentSpaceId ? (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>오늘 할 일</Text>
            <Text style={styles.summaryText}>
              현재 기간 기준 {completedCount}/{totalCount}개를 완료했어요.
            </Text>
          </View>
        ) : null}

        {isSpaceLoading ? <LoadingState message="스페이스를 불러오는 중이에요." /> : null}

        {!isSpaceLoading && isLoading ? (
          <LoadingState message="오늘 할 일을 불러오는 중이에요." />
        ) : null}

        {!isSpaceLoading && !isLoading && errorMessage ? (
          <ErrorState message={errorMessage} actionLabel="다시 시도" onActionPress={loadOccurrences} />
        ) : null}

        {hasNoCurrentSpace ? (
          <ErrorState
            title="스페이스를 찾지 못했어요"
            message="기본 스페이스가 자동으로 만들어져야 해요. 잠시 후 다시 불러와 주세요."
            actionLabel="다시 불러오기"
            onActionPress={refreshSpaces}
          />
        ) : null}

        {currentSpaceId && !isSpaceLoading && hasNoOccurrences ? (
          <EmptyState
            title="오늘 표시할 할 일이 없어요"
            description="할 일 만들기 버튼으로 반복 할 일을 추가해요."
            actionLabel="할 일 만들기"
            onActionPress={() => router.push('/create-todo')}
          />
        ) : null}

        {currentSpaceId && !isSpaceLoading && !isLoading && !errorMessage
          ? sections.map((section) => (
              <OccurrenceSection
                key={section.type}
                section={section}
                onOpenMenu={setSelectedOccurrence}
                onPressOccurrence={handlePressOccurrence}
              />
            ))
          : null}
      </ScrollView>
      {currentSpaceId ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="할 일 만들기"
          onPress={() => router.push('/create-todo')}
          style={({ pressed }) => [
            styles.floatingButton,
            { bottom: insets.bottom + 24 },
            pressed && styles.floatingButtonPressed,
          ]}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </Pressable>
      ) : null}
      <OccurrenceActionSheet
        occurrence={selectedOccurrence}
        onClose={() => setSelectedOccurrence(null)}
        onComplete={completeSelectedOccurrence}
        onEdit={editSelectedOccurrence}
        onViewHistory={viewSelectedOccurrenceHistory}
        onUncomplete={uncompleteSelectedOccurrence}
      />
      <UncompleteConfirmModal
        occurrence={confirmUncompleteOccurrence}
        onCancel={() => setConfirmUncompleteOccurrence(null)}
        onConfirm={handleConfirmUncomplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  summary: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 15,
    color: '#77776B',
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
