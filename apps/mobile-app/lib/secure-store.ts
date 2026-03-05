import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "otbl_access_token";
const REFRESH_TOKEN_KEY = "otbl_refresh_token";

const isWeb = Platform.OS === "web";

/**
 * Store the access token securely
 */
export async function setAccessToken(token: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/**
 * Get the stored access token
 */
export async function getAccessToken(): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/**
 * Store the refresh token securely
 */
export async function setRefreshToken(token: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/**
 * Get the stored refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Store both tokens at once (used after login or token refresh)
 */
export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await Promise.all([
    setAccessToken(accessToken),
    setRefreshToken(refreshToken),
  ]);
}

/**
 * Clear all stored tokens (used on logout)
 */
export async function clearTokens(): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Check if tokens exist (quick check without verifying validity)
 */
export async function hasTokens(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}
