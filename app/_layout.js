import { useContext, useEffect } from 'react';
import { LogBox } from 'react-native';
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

  return (
    <AlertProvider>
      <AuthProvider>
        <SessionGate colors={colors} />
      </AuthProvider>
    </AlertProvider>
  );
}

//===== (SessionGate) ======
function SessionGate({ colors }) {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);

  //===== (Session Check Effect) ======
  useEffect(() => {
    let isMounted = true;

    //===== (checkSession) ======
    const checkSession = async () => {
      try {
        const token = await getValidRememberedToken();

        if (token) {
          const userInfo = (await getUserInfo()) ?? getUserFromToken(token);

          if (userInfo && isMounted) {
            setUser(userInfo);
          }

          if (isMounted) {
            router.replace('/(home)/plant');
          }
        } else {
          if (isMounted) {
            router.replace('/(auth)/login');
          }
        }
      } catch {
        if (isMounted) {
          router.replace('/(auth)/login');
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [setUser, router]);

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
    </SafeAreaView>
  );
}
