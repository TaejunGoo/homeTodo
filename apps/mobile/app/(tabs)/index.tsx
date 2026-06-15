import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { OccurrenceActionSheet } from '@/components/home/occurrence-action-sheet';
import { OccurrenceSection } from '@/components/home/occurrence-section';
import { UncompleteConfirmModal } from '@/components/home/uncomplete-confirm-modal';
import { LoadingState } from '@/components/loading-state';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSpace } from '@/contexts/space-context';
import { useHomeOccurrences } from '@/hooks/use-home-occurrences';
import type { ChoreOccurrence } from '@/lib/chore-occurrences';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentSpace, currentSpaceId } = useSpace();
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
  } = useHomeOccurrences(currentSpaceId);
  const [confirmUncompleteOccurrence, setConfirmUncompleteOccurrence] =
    useState<ChoreOccurrence | null>(null);

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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="스페이스 선택"
            hitSlop={8}
            onPress={() => router.push('/select-space')}
            style={({ pressed }) => [styles.spaceSelector, pressed && styles.spaceSelectorPressed]}
          >
            <Text style={styles.spaceLabel}>현재 스페이스</Text>
            <View style={styles.spaceNameRow}>
              <Text style={styles.spaceName}>{currentSpace?.name ?? '스페이스 없음'}</Text>
              <IconSymbol name="chevron.down" size={24} color="#77776B" />
            </View>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>오늘 할 집안일</Text>
          <Text style={styles.summaryText}>
            현재 기간 기준 {completedCount}/{totalCount}개를 완료했어요.
          </Text>
        </View>

        {isLoading ? <LoadingState message="오늘 할 일을 불러오는 중이에요." /> : null}

        {!isLoading && errorMessage ? (
          <ErrorState message={errorMessage} actionLabel="다시 시도" onActionPress={loadOccurrences} />
        ) : null}

        {hasNoOccurrences ? (
          <EmptyState
            title="오늘 표시할 TODO가 없어요"
            description="TODO 만들기 버튼으로 반복 집안일을 추가해요."
            actionLabel="TODO 만들기"
            onActionPress={() => router.push('/create-todo')}
          />
        ) : null}

        {!isLoading && !errorMessage
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
      <OccurrenceActionSheet
        occurrence={selectedOccurrence}
        onClose={() => setSelectedOccurrence(null)}
        onComplete={completeSelectedOccurrence}
        onEdit={editSelectedOccurrence}
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
    paddingTop: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  spaceSelector: {
    flex: 1,
  },
  spaceSelectorPressed: {
    opacity: 0.72,
  },
  spaceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spaceLabel: {
    fontSize: 13,
    color: '#77776B',
    marginBottom: 4,
  },
  spaceName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2520',
    flexShrink: 1,
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
