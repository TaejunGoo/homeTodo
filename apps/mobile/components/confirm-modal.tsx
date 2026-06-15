import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: 'default' | 'danger';
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  visible,
  title,
  cancelLabel = '취소',
  confirmLabel,
  confirmVariant = 'default',
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              disabled={isConfirming}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && !isConfirming && styles.buttonPressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              disabled={isConfirming}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                confirmVariant === 'danger' && styles.confirmDangerButton,
                isConfirming && styles.buttonDisabled,
                pressed && !isConfirming && styles.buttonPressed,
              ]}
            >
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(31, 37, 32, 0.38)',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9D7CD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  confirmDangerButton: {
    backgroundColor: '#B23B2E',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#55564E',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
