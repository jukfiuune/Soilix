import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Device } from "../context/DeviceContext";

type ThresholdKey = "soilHumidity" | "soilTemp" | "airTemp" | "airHumidity";
type AlertDirection = "low" | "high";
type AlertId = `${string}:${ThresholdKey}:${AlertDirection}`;

type ThresholdConfig = {
  low: number;
  high: number;
  label: string;
  unit: string;
  readingKey: keyof Device["readings"];
};

const THRESHOLDS: Record<ThresholdKey, ThresholdConfig> = {
  soilHumidity: {
    low: 20,
    high: 90,
    label: "Soil Humidity",
    unit: "%",
    readingKey: "soilHumidity",
  },
  soilTemp: {
    low: 5,
    high: 40,
    label: "Soil Temperature",
    unit: "°C",
    readingKey: "soilTemp",
  },
  airTemp: {
    low: -5,
    high: 45,
    label: "Air Temperature",
    unit: "°C",
    readingKey: "airTemp",
  },
  airHumidity: {
    low: 15,
    high: 95,
    label: "Air Humidity",
    unit: "%",
    readingKey: "airHumidity",
  },
};

async function sendAlert(title: string, body: string) {
  if (Platform.OS === "web") return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        ...(Platform.OS === "android" ? { channelId: "sensor-alerts" } : {}),
      },
      trigger: null,
    });
  } catch {
    // Notification delivery is non-critical.
  }
}

export function useAlertThresholds(devices: Device[]) {
  const activeAlerts = useRef<Set<AlertId>>(new Set());

  useEffect(() => {
    if (Platform.OS === "web") return;

    for (const device of devices) {
      if (!device.hasLiveData) continue;

      for (const [key, config] of Object.entries(THRESHOLDS) as [ThresholdKey, ThresholdConfig][]) {
        const value = device.readings[config.readingKey] as number;
        const lowId: AlertId = `${device.id}:${key}:low`;
        const highId: AlertId = `${device.id}:${key}:high`;

        if (value < config.low) {
          if (!activeAlerts.current.has(lowId)) {
            activeAlerts.current.add(lowId);
            void sendAlert(
              device.name,
              `${config.label} is critically low (${value.toFixed(1)}${config.unit})`,
            );
          }
        } else {
          activeAlerts.current.delete(lowId);
        }

        if (value > config.high) {
          if (!activeAlerts.current.has(highId)) {
            activeAlerts.current.add(highId);
            void sendAlert(
              device.name,
              `${config.label} is critically high (${value.toFixed(1)}${config.unit})`,
            );
          }
        } else {
          activeAlerts.current.delete(highId);
        }
      }
    }
  }, [devices]);
}
