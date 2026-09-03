//===== (Imports) ======
import { Stack } from 'expo-router';

//===== (AuthLayout) ======
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    />
  );
}
