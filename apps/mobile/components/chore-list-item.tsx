import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ChoreListItemProps = {
  title: string;
  meta?: string;
  completed?: boolean;
  recentCompletionStatuses?: boolean[];
  showCheckbox?: boolean;
  onPress?: () => void;
  onMenuPress?: () => void;
};

export function ChoreListItem({
  title,
  meta,
  completed = false,
  recentCompletionStatuses = [],
  showCheckbox = false,
  onPress,
  onMenuPress,
}: ChoreListItemProps) {
  const [mainPressed, setMainPressed] = useState(false);

  return (
    <View
      style={[styles.item, completed && styles.itemCompleted, mainPressed && styles.itemPressed]}
    >
      <Pressable
        accessibilityRole={showCheckbox ? 'checkbox' : 'button'}
        accessibilityState={showCheckbox ? { checked: completed } : undefined}
        onPress={onPress}
        onPressIn={() => setMainPressed(true)}
        onPressOut={() => setMainPressed(false)}
        style={styles.mainArea}
      >
        {showCheckbox && (
          <Text style={[styles.checkbox, completed && styles.checkboxCompleted]}>
            {completed ? '✔' : ''}
          </Text>
        )}
        <View style={styles.textGroup}>
          <Text style={[styles.title, completed && styles.titleCompleted]}>{title}</Text>
          <View style={styles.metaRow}>
            {meta && <Text style={styles.meta}>{meta}</Text>}
            {recentCompletionStatuses.length > 0 && (
              <View
                accessibilityLabel={`최근 ${recentCompletionStatuses.length}회 중 ${
                  recentCompletionStatuses.filter(Boolean).length
                }회 완료`}
                style={styles.recentStatusGroup}
              >
                {[...recentCompletionStatuses].reverse().map((isCompleted, index) => (
                  <View
                    key={`${index}-${isCompleted ? 'completed' : 'missed'}`}
                    style={[
                      styles.recentStatusDot,
                      isCompleted ? styles.recentStatusDotCompleted : styles.recentStatusDotMissed,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title} 메뉴 열기`}
        hitSlop={8}
        onPress={onMenuPress}
        style={({ pressed }) => [styles.more, pressed && styles.morePressed]}
      >
        <Text style={styles.moreText}>⋮</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E2DA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCompleted: {
    backgroundColor: '#FAFAF7',
  },
  itemPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: '#E8F2E8',
    color: '#2F7D4A',
    fontWeight: '700',
  },
  checkboxCompleted: {
    backgroundColor: '#DDEBDD',
  },
  mainArea: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2520',
  },
  titleCompleted: {
    color: '#8B8B80',
    textDecorationLine: 'line-through',
  },
  meta: {
    fontSize: 13,
    color: '#77776B',
    flexShrink: 1,
  },
  metaRow: {
    minHeight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  recentStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  recentStatusDotCompleted: {
    backgroundColor: '#36A269',
  },
  recentStatusDotMissed: {
    backgroundColor: '#D7D5CC',
  },
  more: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  moreText: {
    fontSize: 18,
    color: '#8B8B80',
  },
});
