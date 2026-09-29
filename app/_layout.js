import { useContext, useEffect, useState } from 'react';
import { LogBox, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import {
  getUserFromToken,
  getUserInfo,
  getValidRememberedToken,
} from '@/auth/token';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
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
SplashScreen.preventAutoHideAsync().catch(() => {});

LogBox.ignoreLogs([
  'expo-notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

//===== (Layout) ======
export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Nunito': require('@/assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Regular': require('@/assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Medium': require('@/assets/fonts/Nunito-Medium.ttf'),
    'Nunito-SemiBold': require('@/assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('@/assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('@/assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-Black': require('@/assets/fonts/Nunito-Black.ttf'),
  });

  return (
    <AppSettingsProvider>
      <RootLayoutContent fontsLoaded={fontsLoaded} />
    </AppSettingsProvider>
  );
}

//===== (RootLayoutContent) ======
function RootLayoutContent({ fontsLoaded }) {
  const { colors } = useAppSettings();

  return (
    <AlertProvider>
      <AuthProvider>
        <SessionGate colors={colors} fontsLoaded={fontsLoaded} />
      </AuthProvider>
    </AlertProvider>
  );
}

//===== (SessionGate) ======
function SessionGate({ colors, fontsLoaded }) {
  const router = useRouter();
  const { setUser } = useContext(AuthContext);
  const [sessionReady, setSessionReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

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
            setSessionReady(true);
          }
        } else {
          if (isMounted) {
            router.replace('/(auth)/login');
            setSessionReady(true);
          }
        }
      } catch {
        if (isMounted) {
          router.replace('/(auth)/login');
          setSessionReady(true);
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
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
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

      {!splashFinished && (
        <AnimatedSplashScreen
          isReady={sessionReady && fontsLoaded}
          onFinish={() => setSplashFinished(true)}
        />
      )}
    </View>
  );
}

