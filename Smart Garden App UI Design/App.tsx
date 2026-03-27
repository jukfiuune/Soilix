import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { DeviceProvider } from "./src/context/DeviceContext";
import { AppNavigator } from "./src/navigation/AppNavigator";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#eefbf3",
    card: "#ffffff",
    text: "#16331f",
    border: "#d7e8dc",
    primary: "#2f8f46",
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DeviceProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </DeviceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
