import {
  getUserFromToken,
  getUserInfo,
  getValidRememberedToken,
} from '@/auth/token';
import { Stack, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {
  AuthContext,
  AuthProvider,
} from '../context/AuthContext';
import {
  AppSettingsProvider,
  useAppSettings,
} from '../context/AppSettingsContext';
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
  const { colors } = useAppSettings();
  const { width, height } = useWindowDimensions();

  const isCompactHeight = height < 720;
  const logoSize = clamp(width * 0.24, isCompactHeight ? 72 : 84, 100);

  return (
    <AuthProvider>
      <SessionGate colors={colors} logoSize={logoSize} />
    </AuthProvider>
  );
}

function SessionGate({ colors, logoSize }) {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const [showBootSplash, setShowBootSplash] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [nextRoute, setNextRoute] = useState('/(auth)/login');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await getValidRememberedToken();

        if (token) {
          const userInfo = (await getUserInfo()) ?? getUserFromToken(token);

          if (userInfo) {
            setUser(userInfo);
          }

          setNextRoute('/(home)/plant');
        } else {
          setNextRoute('/(auth)/login');
        }
      } catch {
        setNextRoute('/(auth)/login');
      } finally {
        setSessionReady(true);
      }
    };

    checkSession();
  }, [setUser]);

  const handleBootSplashPress = () => {
    if (!sessionReady) return;

    setShowBootSplash(false);
    router.replace(nextRoute);
  };

  return (
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