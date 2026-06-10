import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ScreenHeadingProps = {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backLabel?: string;
};

export function ScreenHeading({
  title,
  description,
  showBackButton = false,
  backLabel = '뒤로',
}: ScreenHeadingProps) {
  return (
    <View style={styles.header}>
      {showBackButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Text style={styles.backText}>‹ {backLabel}</Text>
        </Pressable>
      )}

      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backButtonPressed: {
    opacity: 0.72,
  },
  backText: {
    fontSize: 17,
    color: '#2F6F67',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    color: '#77776B',
  },
});
