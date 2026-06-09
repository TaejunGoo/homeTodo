import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function CreateTodoScreen() {
  const [title, setTitle] = useState('');
  type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'interval_days';

  const recurrenceOptions: { label: string; value: RecurrenceType }[] = [
    { label: '매일', value: 'daily' },
    { label: '매주', value: 'weekly' },
    { label: '매월', value: 'monthly' },
    { label: 'N일마다', value: 'interval_days' },
  ];

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('daily');
  const [intervalDays, setIntervalDays] = useState<string>('3');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ 취소</Text>
        </Pressable>

        <Text style={styles.title}>TODO 만들기</Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 화장실 청소"
            placeholderTextColor="#99998E"
            value={title}
            onChangeText={setTitle}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>반복 주기</Text>

          <View style={styles.segmentGroup}>
            {recurrenceOptions.map((option) => {
              const selected = option.value === recurrenceType;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setRecurrenceType(option.value)}
                  style={({ pressed }) => [
                    styles.segment,
                    selected && styles.segmentSelected,
                    pressed && styles.segmentPressed,
                  ]}
                >
                  <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {recurrenceType === 'interval_days' && (
            <View style={styles.intervalField}>
              <Text style={styles.label}>반복 간격</Text>
              <TextInput
                style={styles.input}
                value={intervalDays}
                onChangeText={setIntervalDays}
                keyboardType="number-pad"
                returnKeyType="done"
                placeholder="예: 3"
                placeholderTextColor="#99998E"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomAction}>
        <Pressable
          disabled={title.trim().length === 0}
          style={({ pressed }) => [
            styles.primaryButton,
            title.trim().length === 0 && styles.primaryButtonDisabled,
            pressed && title.trim().length > 0 && styles.primaryButtonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>생성</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F4',
  },
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 17,
    color: '#2F6F67',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2520',
  },
  headerSpacer: {
    width: 52,
  },
  form: {
    padding: 20,
    gap: 24,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#55564E',
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D7CD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1F2520',
  },
  segmentGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D7CD',
  },
  segmentSelected: {
    backgroundColor: '#2F6F67',
    borderColor: '#2F6F67',
  },
  segmentPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  segmentText: {
    fontSize: 15,
    color: '#55564E',
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  intervalField: {
    marginTop: 12,
    gap: 8,
  },
  bottomAction: {
    marginTop: 'auto',
    padding: 20,
    paddingBottom: 24,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F6F67',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButtonDisabled: {
    backgroundColor: '#B9B9B0',
  },
  primaryButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
