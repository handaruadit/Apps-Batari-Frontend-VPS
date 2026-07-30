//===== (Imports) ======
import { Stack } from 'expo-router';
import { appColors } from '@/config/theme';

//===== (AuthLayout) ======
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: appColors.screen },
      }}
    />
  );
}
