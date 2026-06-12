import { StyleSheet, Text, View } from 'react-native';
import Toast, { type ToastConfig } from 'react-native-toast-message';

interface ToastRenderProps {
  text1?: string;
}

const toastConfig: ToastConfig = {
  success: ({ text1 }: ToastRenderProps) => <SimpleToast message={text1} />,
  error: ({ text1 }: ToastRenderProps) => <SimpleToast message={text1} />,
  info: ({ text1 }: ToastRenderProps) => <SimpleToast message={text1} />,
};

export function AppToast() {
  return <Toast config={toastConfig} position="bottom" bottomOffset={88} visibilityTime={1800} />;
}

function SimpleToast({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 320,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 37, 32, 0.78)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: '#EDEDE7',
    textAlign: 'center',
  },
});
