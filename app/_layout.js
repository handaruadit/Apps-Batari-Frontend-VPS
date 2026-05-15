import { clearAuth } from '@/auth/token';
import { appColors } from '@/config/theme';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const BOOT_SPLASH_DURATION_MS = 1000;
const BATARI_LOGO = require('../assets/images/Asset App Batari Alternative.png');

export default function Layout() {
  const router = useRouter();
  const [showBootSplash, setShowBootSplash] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timer;

    const prepareApp = async () => {
      try {
        await clearAuth();
      } catch {
        // Tetap lanjut ke login meskipun storage gagal dibersihkan.
      }

      timer = setTimeout(() => {
        if (!isMounted) {
          return;
        }

        setShowBootSplash(false);
        router.replace('/(auth)/login');
      }, BOOT_SPLASH_DURATION_MS);
    };

    prepareApp();

    return () => {
      isMounted = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [router]);

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: appColors.screen }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: appColors.screen },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="plant/[id]" />
        </Stack>
        {showBootSplash && (
          <View style={styles.bootSplash}>
            <Image
              source={BATARI_LOGO}
              style={styles.bootSplashLogo}
              resizeMode="contain"
            />
          </View>
        )}
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  bootSplash: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.screen,
  },
  bootSplashLogo: {
    width: '42%',
    maxWidth: 180,
    minWidth: 104,
    aspectRatio: 1,
  },
});
