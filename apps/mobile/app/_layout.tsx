import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import AuthGate from '@/components/auth-gate';
import { SpaceProvider } from '@/contexts/space-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGate>
        <SpaceProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="modal"
              options={{ headerShown: true, presentation: 'modal', title: 'Modal' }}
            />
          </Stack>
        </SpaceProvider>
      </AuthGate>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
