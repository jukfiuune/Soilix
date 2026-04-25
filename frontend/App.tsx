import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { DeviceProvider } from "./src/context/DeviceContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { lightColors, darkColors } from "./src/theme/colors";
import { useNotificationSetup } from "./src/hooks/useNotificationSetup";

function AppContent() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const c = isDark ? darkColors : lightColors;

  useNotificationSetup();

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: c.background,
      card: c.card,
      text: c.text,
      border: c.border,
      primary: c.primary,
    },
  };

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={c.background} translucent={false} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DeviceProvider>
          <AppContent />
        </DeviceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
