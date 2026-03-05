import { Stack } from "expo-router";

/**
 * Auth group layout — screens shown when not authenticated
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='login' />
    </Stack>
  );
}
