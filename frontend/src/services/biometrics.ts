// Biometric quick-unlock helpers.
// Biometrics guard a LOCAL lock only — the real Supabase session still lives in
// its own secure storage. This just gates access to the already-logged-in app.
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const KEY = "biometric_setting"; // null = never asked, "true" = on, "false" = off

// Does this device have fingerprint/face hardware AND an enrolled biometric?
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

// Raw stored choice: null (never asked), "true", or "false".
export async function getBiometricSetting(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  return (await getBiometricSetting()) === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, enabled ? "true" : "false");
  } catch {
    // ignore write failures; app still works with password login
  }
}

// Prompt the OS biometric dialog. Returns true on success.
export async function authenticateBiometric(): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Saphin AI",
      fallbackLabel: "Use device PIN",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}