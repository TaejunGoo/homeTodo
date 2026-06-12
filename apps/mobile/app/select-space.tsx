import { ScreenHeading } from '@/components/screen-heading';
import { useSpace } from '@/contexts/space-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectSpaceScreen() {
  const { spaces, currentSpaceId, isLoading, errorMessage, selectSpace } = useSpace();
  const [draftSpaceId, setDraftSpaceId] = useState<string | null>(currentSpaceId);
  const isConfirmDisabled = !draftSpaceId;
  useEffect(() => {
    setDraftSpaceId(currentSpaceId);
  }, [currentSpaceId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeading
          title="스페이스 선택"
          description="함께 관리할 집안일 공간을 선택해요."
          showBackButton
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참여 중인 스페이스</Text>

          {isLoading ? <Text style={styles.stateText}>스페이스를 불러오는 중...</Text> : null}

          {errorMessage ? (
            <Text style={styles.errorText} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          {!isLoading && !errorMessage && spaces.length === 0 ? (
            <Text style={styles.stateText}>참여 중인 스페이스가 없어요.</Text>
          ) : null}

          {spaces.map((space) => {
            const isSelected = space.id === draftSpaceId;

            return (
              <Pressable
                key={space.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setDraftSpaceId(space.id)}
                style={({ pressed }) => [
                  styles.spaceItem,
                  isSelected && styles.spaceItemSelected,
                  pressed && styles.spaceItemPressed,
                ]}
              >
                <View style={styles.spaceTextGroup}>
                  <Text style={styles.spaceName}>{space.name}</Text>
                  <Text style={styles.spaceMeta}>참여 중</Text>
                </View>

                {isSelected ? <Text style={styles.selectedMark}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="확인"
            disabled={isConfirmDisabled}
            onPress={() => {
              if (draftSpaceId) {
                selectSpace(draftSpaceId);
                router.back();
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              isConfirmDisabled && styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>확인</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="새 스페이스 만들기"
            onPress={() => router.push('/create-space')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>새 스페이스 만들기</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="초대 코드로 참여"
            onPress={() => router.push('/join-invite')}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>초대 코드로 참여</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    paddingTop: 48,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#77776B',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#B3261E',
  },
  spaceItem: {
    minHeight: 64,
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
  spaceItemSelected: {
    borderColor: '#2F6F67',
    backgroundColor: '#F0F7F4',
  },
  spaceItemPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  spaceTextGroup: {
    flex: 1,
    gap: 2,
  },
  spaceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2520',
  },
  spaceMeta: {
    fontSize: 13,
    color: '#77776B',
  },
  selectedMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F6F67',
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  primaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    backgroundColor: '#B9B9B0',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2F6F67',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2F6F67',
  },
});
