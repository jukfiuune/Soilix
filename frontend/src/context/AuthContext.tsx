import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { apiRequest, setUnauthorizedHandler } from "../config/api";

type User = {
  email: string;
  id: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
};

type AuthContextType = {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<string | null>;
};

type AuthResponse = {
  message: string;
  user_id?: string;
  display_name: string;
  refresh_token: string;
  access_token: string;
};

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

type SignupResponse = {
  message: string;
  display_name: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authStorageKey = "soilix.auth.user";

function decodeBase64(value: string) {
  const globalAtob = globalThis.atob;
  if (typeof globalAtob === "function") {
    return globalAtob(value);
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let buffer = 0;
  let bits = 0;

  for (const char of value.replace(/=+$/, "")) {
    const index = chars.indexOf(char);
    if (index < 0) continue;

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

/** Decode a JWT and return the exp claim (seconds since epoch), or 0 on failure. */
function getJwtExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];
    if (!payload) return 0;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const decoded = JSON.parse(decodeBase64(padded));
    return typeof decoded.exp === "number" ? decoded.exp : 0;
  } catch {
    return 0;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getJwtExpiry(token);
  if (!exp) return true;
  // Treat tokens expiring within the next 60 s as already expired.
  return Date.now() / 1000 > exp - 60;
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // Keep a ref so the API layer's callback always gets the latest refresh token
  // without needing a stale closure.
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  const persistUser = async (u: User) => {
    setUser(u);
    userRef.current = u;
    await AsyncStorage.setItem(authStorageKey, JSON.stringify(u));
  };

  const clearUser = async () => {
    setUser(null);
    userRef.current = null;
    await AsyncStorage.removeItem(authStorageKey);
  };

  /** Attempts to exchange the stored refresh token for a new access token.
   *  Returns the new access token on success, or null when the session is gone. */
  const refreshTokens = async (): Promise<string | null> => {
    const current = userRef.current;
    if (!current?.refreshToken) return null;

    try {
      const response = await apiRequest<RefreshResponse>("/api/auth/refresh", {
        method: "POST",
        body: { refresh_token: current.refreshToken },
        skipAuthRetry: true,
      });

      const updated: User = {
        ...current,
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      };
      await persistUser(updated);
      return response.access_token;
    } catch {
      await clearUser();
      return null;
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(authStorageKey);
        if (!storedUser) return;

        const parsedUser = JSON.parse(storedUser) as User;
        if (!parsedUser?.accessToken || !parsedUser?.email) return;

        if (isTokenExpired(parsedUser.accessToken)) {
          // Silently attempt a refresh before giving up.
          userRef.current = parsedUser;
          const newToken = await refreshTokens();
          if (!newToken) {
            await clearUser();
          }
        } else {
          setUser(parsedUser);
          userRef.current = parsedUser;
        }
      } catch {
        await AsyncStorage.removeItem(authStorageKey);
      } finally {
        setInitializing(false);
      }
    };

    void restoreSession();
  }, []);

  // Register the API layer's 401 handler once on mount.
  useEffect(() => {
    setUnauthorizedHandler(refreshTokens);
    return () => setUnauthorizedHandler(async () => null);
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error("Email and password are required");
    }

    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email: normalizedEmail, password },
    });

    if (!response.access_token || !response.refresh_token) {
      throw new Error("Login response did not include session tokens");
    }

    const nextUser: User = {
      id: response.user_id || normalizedEmail,
      email: normalizedEmail,
      displayName: response.display_name || getDisplayNameFallback(normalizedEmail),
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };

    await persistUser(nextUser);
  };

  const signup = async (email: string, password: string, confirmPassword: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || !confirmPassword) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    await apiRequest<SignupResponse>("/api/auth/signup", {
      method: "POST",
      body: {
        email: normalizedEmail,
        password,
        display_name: getDisplayNameFallback(normalizedEmail),
      },
    });
  };

  const logout = async () => {
    await clearUser();
  };

  return (
    <AuthContext.Provider value={{ user, initializing, login, signup, logout, refreshTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

function getDisplayNameFallback(email: string) {
  return email.split("@")[0] || "Gardener";
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
