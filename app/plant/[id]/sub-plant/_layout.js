import { Stack } from 'expo-router';

export default function SubPlantLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="data-battery" />
      <Stack.Screen name="data-grid" />
      <Stack.Screen name="data-load" />
      <Stack.Screen name="data-pv" />
    </Stack>
  );
}
