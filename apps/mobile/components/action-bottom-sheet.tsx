import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ActionBottomSheetAction {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  variant?: 'default' | 'cancel';
}

interface ActionBottomSheetProps {
  visible: boolean;
  title: string;
  actions: ActionBottomSheetAction[];
  onClose: () => void;
}

export function ActionBottomSheet({ visible, title, actions, onClose }: ActionBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['34%'], []);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);

  useEffect(() => {
    setIsBackdropVisible(visible);
  }, [visible]);

  function closeWithAnimation() {
    setIsBackdropVisible(false);
    bottomSheetRef.current?.close();
  }

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {isBackdropVisible ? (
        <Pressable
          accessibilityRole="button"
          style={styles.backdrop}
          onPress={closeWithAnimation}
        />
      ) : null}
      <BottomSheet
        ref={bottomSheetRef}
        backgroundStyle={styles.background}
        enablePanDownToClose
        handleIndicatorStyle={styles.handleIndicator}
        index={0}
        onClose={onClose}
        snapPoints={snapPoints}
      >
        <BottomSheetView style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.title}>{title}</Text>

          {actions.map((action) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel ?? action.label}
              key={action.label}
              onPress={action.variant === 'cancel' ? closeWithAnimation : action.onPress}
              style={({ pressed }) => [
                action.variant === 'cancel' ? styles.cancelAction : styles.action,
                pressed && styles.actionPressed,
              ]}
            >
              <Text style={action.variant === 'cancel' ? styles.cancelText : styles.actionText}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    elevation: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31, 37, 32, 0.32)',
  },
  background: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  handleIndicator: {
    width: 36,
    backgroundColor: '#D9D7CD',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 2,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 4,
  },
  action: {
    minHeight: 48,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#F7F7F4',
  },
  actionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2520',
  },
  cancelAction: {
    minHeight: 48,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#77776B',
    textAlign: 'center',
  },
});
