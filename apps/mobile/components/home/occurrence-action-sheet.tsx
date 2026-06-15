import { ActionBottomSheet } from '@/components/action-bottom-sheet';
import type { ChoreOccurrence } from '@/lib/chore-occurrences';

interface OccurrenceActionSheetProps {
  occurrence: ChoreOccurrence | null;
  onClose: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onViewHistory: () => void;
  onUncomplete: () => void;
}

export function OccurrenceActionSheet({
  occurrence,
  onClose,
  onComplete,
  onEdit,
  onViewHistory,
  onUncomplete,
}: OccurrenceActionSheetProps) {
  const isCompleted = occurrence?.isCompleted === true;
  const primaryActionLabel = isCompleted ? '완료 취소' : '완료';

  return (
    <ActionBottomSheet
      actions={[
        {
          label: primaryActionLabel,
          onPress: isCompleted ? onUncomplete : onComplete,
        },
        {
          label: '이력 보기',
          accessibilityLabel: 'TODO 이력 보기',
          onPress: onViewHistory,
        },
        {
          label: 'TODO 수정/삭제',
          accessibilityLabel: 'TODO 수정 및 삭제',
          onPress: onEdit,
        },
        {
          label: '취소',
          accessibilityLabel: '메뉴 취소',
          onPress: onClose,
          variant: 'cancel',
        },
      ]}
      onClose={onClose}
      title={occurrence?.chore.title ?? 'TODO 메뉴'}
      visible={occurrence !== null}
    />
  );
}
