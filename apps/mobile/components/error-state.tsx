import { Pressable, StyleSheet, Text, View } from 'react-native';

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ErrorState({
  title = '문제가 발생했어요',
  message,
  actionLabel,
  onActionPress,
}: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionLabel && onActionPress && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7C8C1',
    backgroundColor: '#FFF7F5',
    padding: 18,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8F2F24',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8F5A52',
  },
  actionButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B23B2E',
    marginTop: 4,
  },
  actionButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
