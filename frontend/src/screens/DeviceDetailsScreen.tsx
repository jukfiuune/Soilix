import React, { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { ConfirmModal } from "../components/ConfirmModal";
import { IllustratedGarden } from "../components/IllustratedGarden";
import { MetricPill } from "../components/MetricPill";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useDevices } from "../context/DeviceContext";
import { RootStackParamList } from "../navigation/types";
import { useAppColors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "DeviceDetails">;

export function DeviceDetailsScreen({ navigation, route }: Props) {
  const c = useAppColors();
  const { getDevice, removeDevice, renameDevice, updateSendInterval } = useDevices();
  const [disconnectModalVisible, setDisconnectModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftIntervalSeconds, setDraftIntervalSeconds] = useState("");
  const device = getDevice(route.params.deviceId);

  if (!device) {
    return (
      <Screen contentStyle={styles.emptyContent}>
        <Text style={[styles.emptyTitle, { color: c.text }]}>Device not found</Text>
        <AppButton title="Back to Home" onPress={() => navigation.navigate("Main", { screen: "Home" })} />
      </Screen>
    );
  }

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const message = await removeDevice(device.id);
      setDisconnectModalVisible(false);
      navigation.navigate("Main", { screen: "Home" });
      Alert.alert("Device disconnected", message);
    } catch (err) {
      Alert.alert("Could not disconnect device", (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setDraftName(device.name);
    setDraftIntervalSeconds(device.sendIntervalMs ? Math.round(device.sendIntervalMs / 1000).toString() : "");
    setEditModalVisible(true);
  };

  const handleSaveSettings = async () => {
    const trimmedName = draftName.trim();
    const trimmedSeconds = draftIntervalSeconds.trim();

    if (!trimmedName) {
      Alert.alert("Invalid Name", "Device name cannot be empty.");
      return;
    }

    let intervalMs: number | null = null;
    if (trimmedSeconds) {
      const parsedSeconds = Number.parseInt(trimmedSeconds, 10);
      if (!Number.isFinite(parsedSeconds) || !Number.isInteger(parsedSeconds) || parsedSeconds <= 0) {
        Alert.alert("Invalid Update Rate", "Enter the update rate as a whole number of seconds.");
        return;
      }
      intervalMs = parsedSeconds * 1000;
    }

    setSavingSettings(true);
    try {
      if (trimmedName !== device.name) {
        await renameDevice(device.id, trimmedName);
      }

      if (intervalMs !== null && intervalMs !== device.sendIntervalMs) {
        await updateSendInterval(device.id, intervalMs);
      }

      setEditModalVisible(false);
    } catch (err) {
      Alert.alert("Could not save changes", (err as Error).message);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <>
      <Screen>
        {/* Navigation row */}
        <View style={styles.topRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.iconChip,
              { backgroundColor: c.card },
              pressed && styles.iconChipPressed,
            ]}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={c.primary} />
          </Pressable>
          <View style={styles.topActions}>
            <Pressable
              onPress={openEditModal}
              style={({ pressed }) => [
                styles.iconChip,
                { backgroundColor: c.card },
                pressed && styles.iconChipPressed,
              ]}
            >
              <MaterialCommunityIcons name="pencil-outline" size={22} color={c.primary} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Main", { screen: "Profile" })}
              style={({ pressed }) => [
                styles.iconChip,
                { backgroundColor: c.card },
                pressed && styles.iconChipPressed,
              ]}
            >
              <MaterialCommunityIcons name="account-outline" size={22} color={c.primary} />
            </Pressable>
          </View>
        </View>

        <SectionCard style={styles.titleCard}>
          <Text style={[styles.deviceLabel, { color: c.primary }]}>Connected Device</Text>
          <Text style={[styles.deviceTitle, { color: c.text }]}>{device.name}</Text>
          <Text style={[styles.deviceCopy, { color: c.textMuted }]}>
            {device.hasLiveData
              ? "Realtime greenhouse and soil health overview."
              : "This device is connected, but no live sensor reading has been received yet."}
          </Text>
          <Text style={[styles.scheduleText, { color: c.textMuted }]}>
            Updates every {formatIntervalLabel(device.sendIntervalMs)}
          </Text>
        </SectionCard>

        <SectionCard style={styles.metricsCard}>
          <MetricPill icon="gauge" label="Air Pressure" value={formatMetricValue(device.readings.airPressure, " hPa", device.hasLiveData)} tint="#9566d8" />
          <MetricPill icon="water-percent" label="Air Humidity" value={formatMetricValue(device.readings.airHumidity, "%", device.hasLiveData)} tint="#4d96d8" />
          <MetricPill icon="sprout" label="Soil Humidity" value={formatMetricValue(device.readings.soilHumidity, "%", device.hasLiveData)} tint="#4aaf5d" />
          <MetricPill icon="thermometer" label="Air Temperature" value={formatMetricValue(device.readings.airTemp, "°C", device.hasLiveData)} tint="#f28b37" />
          <MetricPill icon="thermometer-lines" label="Soil Temperature" value={formatMetricValue(device.readings.soilTemp, "°C", device.hasLiveData)} tint="#c88f31" />
          <MetricPill icon="weather-windy" label="Wind Speed" value={formatMetricValue(device.readings.windSpeed, " m/s", device.hasLiveData)} tint="#5aa8c4" />
        </SectionCard>

        <IllustratedGarden readings={device.readings} />

        <View style={styles.actions}>
          <AppButton
            title="View Statistics"
            onPress={() => navigation.navigate("Statistics", { deviceId: device.id })}
          />
          <AppButton
            title="Disconnect Device"
            onPress={() => setDisconnectModalVisible(true)}
            variant="outline"
          />
        </View>
      </Screen>

      <ConfirmModal
        visible={disconnectModalVisible}
        title="Disconnect Device"
        description={`Disconnect ${device.name}? You will stop receiving sensor readings for it.`}
        confirmLabel="Disconnect"
        confirmVariant="danger"
        loading={loading}
        onCancel={() => setDisconnectModalVisible(false)}
        onConfirm={handleDisconnect}
      />

      <Modal animationType="fade" transparent visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: c.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Edit Device</Text>
            <Text style={[styles.modalDescription, { color: c.textMuted }]}>
              Update the display name and how often this device checks in.
            </Text>

            <AppTextInput
              label="Device Name"
              value={draftName}
              onChangeText={setDraftName}
              placeholder="e.g. Greenhouse North"
              autoFocus
            />

            <AppTextInput
              label="Update Every"
              value={draftIntervalSeconds}
              onChangeText={setDraftIntervalSeconds}
              placeholder="60"
              keyboardType="number-pad"
              helperText="Seconds between updates. Leave empty to keep the current rate."
            />

            <View style={styles.modalActions}>
              <AppButton title="Cancel" onPress={() => setEditModalVisible(false)} variant="outline" style={styles.modalAction} />
              <AppButton title="Save" onPress={handleSaveSettings} loading={savingSettings} style={styles.modalAction} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconChipPressed: {
    opacity: 0.7,
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
  },
  titleCard: {
    marginBottom: 14,
  },
  deviceLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "700",
  },
  deviceTitle: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "800",
  },
  deviceCopy: {
    marginTop: 8,
    lineHeight: 21,
  },
  scheduleText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  metricsCard: {
    gap: 4,
    marginBottom: 14,
  },
  actions: {
    gap: 12,
    marginTop: 14,
    paddingBottom: 24,
  },
  emptyContent: {
    justifyContent: "center",
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  modalAction: {
    flex: 1,
  },
});

function formatMetricValue(value: number, unit: string, hasLiveData: boolean) {
  if (!hasLiveData) return "N/A";
  return `${value.toFixed(1)}${unit}`;
}

function formatIntervalLabel(intervalMs: number | null) {
  if (!intervalMs) return "the current schedule";

  const totalSeconds = Math.round(intervalMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }

  const minutes = totalSeconds / 60;
  if (Number.isInteger(minutes) && minutes < 60) {
    return `${minutes} min`;
  }

  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours} hr`;
  }

  return `${totalSeconds} sec`;
}
