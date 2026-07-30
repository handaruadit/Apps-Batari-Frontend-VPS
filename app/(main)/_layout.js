//===== (Imports) ======
import { Stack } from 'expo-router';

//===== (MainLayout) ======
export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-device" />
    </Stack>
  );
}
