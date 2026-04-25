import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

const permissionStorageKey = "soilix.notifications.permissionRequested";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotificationSetup() {
  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === "web") return;

      try {
        const alreadyRequested = await AsyncStorage.getItem(permissionStorageKey);

        if (!alreadyRequested) {
          const { status } = await Notifications.requestPermissionsAsync();
          await AsyncStorage.setItem(permissionStorageKey, status);
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("sensor-alerts", {
            name: "Sensor Alerts",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
          });
        }
      } catch {
        // Notification setup is non-critical.
      }
    };

    void setup();
  }, []);
}
