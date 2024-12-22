import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as aesjs from "aes-js";
import "react-native-get-random-values";
import { AppState, Platform } from "react-native";

// Cross-platform secure storage
class CrossPlatformSecureStore {
  private async _encrypt(key: string, value: string) {
    const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));

    const cipher = new aesjs.ModeOfOperation.ctr(
      encryptionKey,
      new aesjs.Counter(1)
    );
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    if (Platform.OS === "web") {
      localStorage.setItem(
        key + "_key",
        aesjs.utils.hex.fromBytes(encryptionKey)
      );
    } else {
      await SecureStore.setItemAsync(
        key + "_key",
        aesjs.utils.hex.fromBytes(encryptionKey)
      );
    }

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async _decrypt(key: string, value: string) {
    const encryptionKeyHex =
      Platform.OS === "web"
        ? localStorage.getItem(key + "_key")
        : await SecureStore.getItemAsync(key + "_key");

    if (!encryptionKeyHex) {
      return null;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1)
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted =
      Platform.OS === "web"
        ? localStorage.getItem(key)
        : await AsyncStorage.getItem(key);

    if (!encrypted) {
      return null;
    }

    return await this._decrypt(key, encrypted);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this._encrypt(key, value);

    if (Platform.OS === "web") {
      localStorage.setItem(key, encrypted);
    } else {
      await AsyncStorage.setItem(key, encrypted);
    }
  }

  async removeItem(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      localStorage.removeItem(key + "_key");
    } else {
      await AsyncStorage.removeItem(key);
      await SecureStore.deleteItemAsync(key + "_key");
    }
  }
}

// Supabase client setup
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new CrossPlatformSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web", // Enable session detection for web
  },
});

// AppState handling for session refresh
if (Platform.OS === "web") {
  // For web, use visibilitychange
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
} else {
  // For mobile, use AppState
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
