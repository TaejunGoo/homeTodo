import { ErrorState } from '@/components/error-state';
import { LoadingState } from '@/components/loading-state';
import { ScreenHeading } from '@/components/screen-heading';
import { useSpace } from '@/contexts/space-context';
import { getSpaceRoleLabel } from '@/lib/spaces';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectSpaceScreen() {
  const { spaces, currentSpaceId, isLoading, errorMessage, refreshSpaces, selectSpace } =
    useSpace();
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
          description="함께 관리할 할 일 공간을 선택해요."
          showBackButton
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참여 중인 스페이스</Text>

          {isLoading ? <LoadingState message="스페이스를 불러오는 중이에요." /> : null}

          {!isLoading && errorMessage ? (
            <ErrorState
              message={errorMessage}
              actionLabel="다시 시도"
              onActionPress={refreshSpaces}
            />
          ) : null}

          {!isLoading && !errorMessage && spaces.length === 0 ? (
            <ErrorState
              title="스페이스가 보이지 않아요"
              message="기본 스페이스가 자동으로 만들어져야 해요. 다시 불러온 뒤에도 보이지 않으면 새 스페이스를 만들거나 초대 코드로 참여해 주세요."
              actionLabel="다시 시도"
              onActionPress={refreshSpaces}
            />
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
                <View style={styles.checkSlot}>
                  <Text style={[styles.selectedMark, !isSelected && styles.selectedMarkHidden]}>
                    ✓
                  </Text>
                </View>

                <View style={styles.spaceTextGroup}>
                  <Text style={styles.spaceName}>{space.name}</Text>
                  <Text style={styles.spaceMeta}>{isSelected ? '현재 선택됨' : '참여 중'}</Text>
                </View>

                <View style={styles.spaceRightGroup}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>{getSpaceRoleLabel(space.role)}</Text>
                  </View>
                </View>
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
  checkSlot: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  spaceRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: '#E8F0EC',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F6F67',
  },
  selectedMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2F6F67',
    textAlign: 'center',
  },
  selectedMarkHidden: {
    opacity: 0,
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
