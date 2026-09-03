import { useContext, useEffect, useState } from 'react';
import {
  Image,
  LogBox,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import {
  getUserFromToken,
  getUserInfo,
  getValidRememberedToken,
} from '@/auth/token';
import { AlertProvider } from '../context/AlertContext';
import {
  AppSettingsProvider,
  useAppSettings,
} from '../context/AppSettingsContext';
import {
  AuthContext,
  AuthProvider,
} from '../context/AuthContext';
import '@/utils/showAlert';

WebBrowser.maybeCompleteAuthSession();

LogBox.ignoreLogs([
  'expo-notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

//===== (Constants) ======
const BATARI_LOGO = require('../assets/images/batari-logo.jpeg');

//===== (clamp) ======
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

//===== (Layout) ======
export default function Layout() {
  return (
    <AppSettingsProvider>
      <RootLayoutContent />
    </AppSettingsProvider>
  );
}

//===== (RootLayoutContent) ======
function RootLayoutContent() {
  const { colors } = useAppSettings();
  const { width, height } = useWindowDimensions();

  //===== (Responsive Splash Metrics) ======
  const isCompactHeight = height < 720;
  const logoSize = clamp(width * 0.24, isCompactHeight ? 72 : 84, 100);

  return (
    <AlertProvider>
      <AuthProvider>
        <SessionGate colors={colors} logoSize={logoSize} />
      </AuthProvider>
    </AlertProvider>
  );
}

//===== (SessionGate) ======
function SessionGate({ colors, logoSize }) {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  const [showBootSplash, setShowBootSplash] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [nextRoute, setNextRoute] = useState('/(auth)/login');

  //===== (Session Check Effect) ======
  useEffect(() => {
    //===== (checkSession) ======
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

  //===== (handleBootSplashPress) ======
  const handleBootSplashPress = () => {
    if (!sessionReady) return;

    setShowBootSplash(false);
    router.replace(nextRoute);
  };

  //===== (Render) ======
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

//===== (Styles) ======
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
