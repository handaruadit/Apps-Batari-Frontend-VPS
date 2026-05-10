import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appColors } from '@/config/theme';

export default function Layout() {
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
          <Stack.Screen name="(main)" />
          <Stack.Screen name="(home)" />
          <Stack.Screen name="plant/[id]" />
        </Stack>
      </SafeAreaView>
    </AuthProvider>
  );
}
