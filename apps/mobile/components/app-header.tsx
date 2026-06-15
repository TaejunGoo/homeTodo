import { IconSymbol } from '@/components/ui/icon-symbol';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  spaceName: string;
  onPressSettings: () => void;
  onPressSpace: () => void;
}

export function AppHeader({ spaceName, onPressSettings, onPressSpace }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="스페이스 선택"
        hitSlop={8}
        onPress={onPressSpace}
        style={({ pressed }) => [styles.spaceSelector, pressed && styles.pressed]}
      >
        <View style={styles.spaceNameRow}>
          <Text numberOfLines={1} style={styles.spaceName}>
            {spaceName}
          </Text>
          <IconSymbol name="chevron.down" size={22} color="#77776B" />
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="설정"
        hitSlop={8}
        onPress={onPressSettings}
        style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
      >
        <IconSymbol name="gearshape.fill" size={22} color="#55564E" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E2DA',
    backgroundColor: '#F7F7F4',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  spaceSelector: {
    flex: 1,
  },
  pressed: {
    opacity: 0.72,
  },
  spaceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spaceName: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2520',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E2DA',
  },
  settingsButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
