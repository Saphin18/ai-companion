// Biometric login (banking-app style): stores email + password in the device's
// encrypted keystore (expo-secure-store). Enabled from Profile (re-enter password),
// used from the Login screen (fingerprint button). Password is only stored when the
// user explicitly enables it and confirms their password.
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const ENABLED_KEY = "biometric_enabled";
const EMAIL_KEY = "biometric_email";
const PW_KEY = "biometric_password";

// Device has fingerprint/face hardware AND an enrolled biometric.
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch {
    return false;
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(ENABLED_KEY)) === "true";
  } catch {
    return false;
  }
}

// Turn on: store credentials in the encrypted keystore + set the flag.
export async function enableBiometric(
  email: string,
  password: string
): Promise<void> {
  await SecureStore.setItemAsync(EMAIL_KEY, email);
  await SecureStore.setItemAsync(PW_KEY, password);
  await SecureStore.setItemAsync(ENABLED_KEY, "true");
}

// Turn off: wipe stored credentials + clear the flag.
export async function disableBiometric(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(EMAIL_KEY);
    await SecureStore.deleteItemAsync(PW_KEY);
  } catch {
    // ignore
  }
  await SecureStore.setItemAsync(ENABLED_KEY, "false");
}

export async function getStoredCredentials(): Promise
  { email: string; password: string } | null
> {
  try {
    const email = await SecureStore.getItemAsync(EMAIL_KEY);
    const password = await SecureStore.getItemAsync(PW_KEY);
    if (email && password) return { email, password };
    return null;
  } catch {
    return null;
  }
}

// Show the OS fingerprint/face prompt. Returns true on success.
export async function authenticateBiometric(): Promise<boolean> {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: "Log in to Saphin AI",
      fallbackLabel: "Use password",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}