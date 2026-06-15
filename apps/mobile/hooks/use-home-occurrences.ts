import {
  getCurrentChoreOccurrenceSections,
  type ChoreOccurrence,
  type ChoreOccurrenceSection,
} from '@/lib/chore-occurrences';
import { getOccurrenceKey, updateOccurrenceCompletion } from '@/lib/chore-occurrence-state';
import { completeChoreOccurrence, uncompleteChoreOccurrence } from '@/lib/completions';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';

export function useHomeOccurrences(currentSpaceId: string | null) {
  const [sections, setSections] = useState<ChoreOccurrenceSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completingKey, setCompletingKey] = useState<string | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<ChoreOccurrence | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOccurrences = useCallback(async () => {
    if (!currentSpaceId) {
      setSections([]);
      setErrorMessage('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const nextSections = await getCurrentChoreOccurrenceSections(currentSpaceId);
      setSections(nextSections);
    } catch {
      setSections([]);
      setErrorMessage('오늘 할 일을 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [currentSpaceId]);

  useFocusEffect(
    useCallback(() => {
      loadOccurrences();
    }, [loadOccurrences]),
  );

  const totalCount = useMemo(
    () => sections.reduce((count, section) => count + section.occurrences.length, 0),
    [sections],
  );
  const completedCount = useMemo(
    () =>
      sections.reduce(
        (count, section) =>
          count + section.occurrences.filter((occurrence) => occurrence.isCompleted).length,
        0,
      ),
    [sections],
  );
  const hasNoOccurrences = !isLoading && !errorMessage && totalCount === 0;

  async function completeOccurrence(occurrence: ChoreOccurrence) {
    if (occurrence.isCompleted || completingKey) {
      return;
    }

    const nextCompletingKey = getOccurrenceKey(occurrence);
    const previousSections = sections;

    setCompletingKey(nextCompletingKey);
    setErrorMessage('');
    setSections((currentSections) =>
      updateOccurrenceCompletion(currentSections, nextCompletingKey, true),
    );

    try {
      await completeChoreOccurrence({
        choreId: occurrence.chore.id,
        spaceId: occurrence.chore.spaceId,
        targetPeriodStart: occurrence.targetPeriodStart,
      });
    } catch {
      setSections(previousSections);
      Toast.show({
        type: 'error',
        text1: 'TODO를 완료하지 못했어요.',
      });
    } finally {
      setCompletingKey(null);
    }
  }

  async function uncompleteOccurrence(occurrence: ChoreOccurrence) {
    if (!occurrence.isCompleted || completingKey) {
      return;
    }

    const nextCompletingKey = getOccurrenceKey(occurrence);
    const previousSections = sections;

    setCompletingKey(nextCompletingKey);
    setErrorMessage('');
    setSections((currentSections) =>
      updateOccurrenceCompletion(currentSections, nextCompletingKey, false),
    );

    try {
      await uncompleteChoreOccurrence({
        choreId: occurrence.chore.id,
        spaceId: occurrence.chore.spaceId,
        targetPeriodStart: occurrence.targetPeriodStart,
      });
    } catch {
      setSections(previousSections);
      Toast.show({
        type: 'error',
        text1: '완료를 취소하지 못했어요.',
      });
    } finally {
      setCompletingKey(null);
    }
  }

  async function completeSelectedOccurrence() {
    if (!selectedOccurrence) {
      return;
    }

    const occurrence = selectedOccurrence;

    setSelectedOccurrence(null);
    await completeOccurrence(occurrence);
  }

  async function uncompleteSelectedOccurrence() {
    if (!selectedOccurrence) {
      return;
    }

    const occurrence = selectedOccurrence;

    setSelectedOccurrence(null);
    await uncompleteOccurrence(occurrence);
  }

  function editSelectedOccurrence() {
    if (!selectedOccurrence) {
      return;
    }

    const choreId = selectedOccurrence.chore.id;

    setSelectedOccurrence(null);
    router.push(`/edit-todo/${choreId}`);
  }

  function viewSelectedOccurrenceHistory() {
    if (!selectedOccurrence) {
      return;
    }

    const choreId = selectedOccurrence.chore.id;

    setSelectedOccurrence(null);
    router.push(`/chore-history/${choreId}`);
  }

  return {
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
  };
}
