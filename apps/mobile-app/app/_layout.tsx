import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import AppProvider from "@/providers/AppProvider";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/lib/constants";

// Keep the splash screen visible while we check auth
SplashScreen.preventAutoHideAsync();

/**
 * Auth navigation guard — redirects based on auth state
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Not signed in → redirect to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Already signed in → redirect to dashboard
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const [loadingError, setLoadingError] = React.useState<string | null>(null);

  useEffect(() => {
    // Timeout if loading takes too long (> 8s)
    const timer = setTimeout(() => {
      if (isLoading) {
        setLoadingError("Connection timed out. Please check your network.");
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    if (loadingError) {
      return (
        <View style={styles.loading}>
          <Text style={{ marginBottom: 10, color: Colors.error }}>
            {loadingError}
          </Text>
          <Text
            onPress={() => {
              setLoadingError(null);
              // Force reload
              router.replace("/");
            }}
            style={{ color: Colors.primary[600], fontWeight: "bold" }}>
            Retry
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size='large'
          color={Colors.primary[600]}
        />
        <Text style={{ marginTop: 10, color: Colors.gray[500] }}>
          Connecting...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Root layout — the top-level layout for the entire app
 */
export default function RootLayout() {
  return (
    <AppProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(auth)' />
          <Stack.Screen name='(app)' />
        </Stack>
        <StatusBar style='auto' />
      </AuthGuard>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray[50],
  },
});
