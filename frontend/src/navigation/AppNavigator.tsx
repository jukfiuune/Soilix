import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { Screen } from "../components/Screen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { DeviceDetailsScreen } from "../screens/DeviceDetailsScreen";
import { StatisticsScreen } from "../screens/StatisticsScreen";
import { useAppColors } from "../theme/colors";
import { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const c = useAppColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          minHeight: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom || 8,
          backgroundColor: c.tabBar,
          borderTopColor: c.border,
          elevation: 0,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === "Home" ? "home-variant-outline" : "account-outline";
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, initializing } = useAuth();
  const c = useAppColors();

  if (initializing) {
    return (
      <Screen scroll={false} contentStyle={styles.loadingContent}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>Restoring session...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Auth" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingWrap: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
  },
});