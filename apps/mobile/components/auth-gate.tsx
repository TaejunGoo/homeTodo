import { supabase } from '@/lib/supabase';
import { router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface AuthGateProps {
  children: React.ReactNode;
}
export default function AuthGate({ children }: AuthGateProps) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isLoginRoute = segments[0] === 'login';

      if (session && isLoginRoute) {
        router.replace('/');
      }

      if (!session && !isLoginRoute) {
        router.replace('/login');
      }

      setIsAuthReady(true);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLoginRoute = segments[0] === 'login';

      if (session && isLoginRoute) {
        router.replace('/');
      }

      if (!session && !isLoginRoute) {
        router.replace('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [segments]);
  return (
    <>
      {children}
      {!isAuthReady ? <View style={styles.authLoadingScreen} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  authLoadingScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F7F7F4',
  },
});
