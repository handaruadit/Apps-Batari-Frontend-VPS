import { clearAuth } from '@/auth/token';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { AppSettingsProvider, useAppSettings } from '../context/AppSettingsContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const BATARI_LOGO = require('../assets/images/batari-logo.jpeg');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function Layout() {
  return (
    <AppSettingsProvider>
      <RootLayoutContent />
    </AppSettingsProvider>
  );
}

function RootLayoutContent() {
  const router = useRouter();
  const { colors } = useAppSettings();
  const { width, height } = useWindowDimensions();
  const [showBootSplash, setShowBootSplash] = useState(true);
  const isCompactHeight = height < 720;
  const logoSize = clamp(width * 0.24, isCompactHeight ? 72 : 84, 100);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await clearAuth();
      } catch {
        // Tetap lanjut ke login meskipun storage gagal dibersihkan.
      }
    };

    prepareApp();
  }, []);

  const handleBootSplashPress = () => {
    setShowBootSplash(false);
    router.replace('/(auth)/login');
  };

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: colors.screen },
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="plant/[id]" />
        </Stack>
        {showBootSplash && (
          <Pressable
            style={[styles.bootSplash, { backgroundColor: colors.screen }]}
            onPress={handleBootSplashPress}
          >
            <Image
              source={BATARI_LOGO}
              style={[
                styles.bootSplashLogo,
                {
                  width: logoSize,
                  height: logoSize,
                  borderRadius: logoSize / 2,
                },
              ]}
              resizeMode="cover"
            />
          </Pressable>
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
  },
  bootSplashLogo: {
    backgroundColor: 'transparent',
  },
});
