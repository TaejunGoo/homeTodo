import { ConfirmModal } from '@/components/confirm-modal';
import type { ChoreOccurrence } from '@/lib/chore-occurrences';

interface UncompleteConfirmModalProps {
  occurrence: ChoreOccurrence | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UncompleteConfirmModal({
  occurrence,
  onCancel,
  onConfirm,
}: UncompleteConfirmModalProps) {
  return (
    <ConfirmModal
      cancelLabel="아니요"
      confirmLabel="완료 취소"
      confirmVariant="danger"
      onCancel={onCancel}
      onConfirm={onConfirm}
      title="완료를 취소할까요?"
      visible={occurrence !== null}
    />
  );
}
