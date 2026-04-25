import React, { useState, useRef } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { AppButton } from "../components/AppButton";
import { MetricPill } from "../components/MetricPill";
import { PromptModal } from "../components/PromptModal";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useDevices } from "../context/DeviceContext";
import { MainTabParamList, RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { devices, loading, error, connectDevice, refreshDevices } = useDevices();
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // Camera State
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("Scan Soilix QR Code");
  const scannedRef = useRef(false);

  const handleAddDevice = () => {
    setModalVisible(true);
  };

  const handleStartScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission Required", "Soilix needs camera access to scan device QR codes.");
        return;
      }
    }
    scannedRef.current = false;
    setScanMessage("Scan Soilix QR Code");
    setIsScanning(true);
  };

  const handleCreateDevice = async (deviceId: string) => {
    const trimmed = deviceId.trim();
    if (!trimmed) {
      Alert.alert("Missing ID", "Please enter a valid device ID.");
      return;
    }

    setCreating(true);

    try {
      const message = await connectDevice(trimmed);
      setModalVisible(false);
      setIsScanning(false); // Close camera if open
      Alert.alert("Device Connected", message);
    } catch (err) {
      Alert.alert("Could not connect device", (err as Error).message);
      scannedRef.current = false;
    } finally {
      setCreating(false);
    }
  };

  // If the camera is active, render the full-screen scanner
  if (isScanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={({ data }) => {
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data);

            if (!isValidUUID) return;
            if (scannedRef.current) return;

            scannedRef.current = true;

            setScanMessage(`Processing ${data}`);

            setTimeout(() => {
              handleCreateDevice(data);
            }, 1500);
          }}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraText}>{scanMessage}</Text>
          <AppButton
            title="Cancel Scan"
            onPress={() => setIsScanning(false)}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  // Normal Home Screen render
  return (
    <>
      <Screen>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Soilix</Text>
            <Text style={styles.title}>Your devices</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("Profile")} style={styles.headerBadge}>
            <MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.actionButtons}>
          <AppButton
            title="Scan QR Code"
            onPress={handleStartScan}
            loading={creating}
          />
          <AppButton
            title="Type ID Manually"
            onPress={handleAddDevice}
            variant="outline"
          />
        </View>

        {loading ? <Text style={styles.helperText}>Loading your connected devices...</Text> : null}
        {error ? (
          <Text style={styles.errorText}>
            {error}
          </Text>
        ) : null}
        {!loading && !error && !devices.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No connected devices yet</Text>
            <Text style={styles.emptyCopy}>Connect a Soilix device to see it here.</Text>
            <AppButton title="Refresh Devices" onPress={() => void refreshDevices()} variant="secondary" />
          </View>
        ) : null}

        <View style={styles.list}>
          {devices.map((device) => (
            <Pressable
              key={device.id}
              onPress={() => navigation.navigate("DeviceDetails", { deviceId: device.id })}
              style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : null]}
            >
              <SectionCard>
                <View style={styles.deviceHeader}>
                  <View>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text style={styles.deviceSub}>
                      {device.hasLiveData ? "Live environmental readings" : "No live readings yet"}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#7b9681" />
                </View>

                <MetricPill
                  icon="thermometer"
                  label="Air Temperature"
                  value={formatMetricValue(device.readings.airTemp, "C", device.hasLiveData)}
                  tint="#f28b37"
                />
                <MetricPill
                  icon="water-percent"
                  label="Air Humidity"
                  value={formatMetricValue(device.readings.airHumidity, "%", device.hasLiveData)}
                  tint="#4d96d8"
                />
                <MetricPill
                  icon="gauge"
                  label="Air Pressure"
                  value={formatMetricValue(device.readings.airPressure, " hPa", device.hasLiveData)}
                  tint="#9566d8"
                />
                <MetricPill
                  icon="sprout"
                  label="Soil Humidity"
                  value={formatMetricValue(device.readings.soilHumidity, "%", device.hasLiveData)}
                  tint="#4aaf5d"
                />
                <MetricPill
                  icon="thermometer-lines"
                  label="Soil Temperature"
                  value={formatMetricValue(device.readings.soilTemp, "C", device.hasLiveData)}
                  tint="#c88f31"
                />
                <MetricPill
                  icon="weather-windy"
                  label="Wind Speed"
                  value={formatMetricValue(device.readings.windSpeed, " m/s", device.hasLiveData)}
                  tint="#5aa8c4"
                />
              </SectionCard>
            </Pressable>
          ))}
        </View>
      </Screen>
      <PromptModal
        visible={modalVisible}
        title="Connect Existing Device"
        description="Enter a valid device ID. The device can be connected only if it currently has no owner."
        placeholder="Device UUID"
        confirmLabel="Connect"
        initialValue=""
        loading={creating}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleCreateDevice}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 4,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  actionButtons: {
    gap: 10,
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 30,
    paddingBottom: 60,
  },
  cameraText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  list: {
    gap: 14,
    marginTop: 16,
    paddingBottom: 20,
  },
  helperText: {
    marginTop: 14,
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "#fdeceb",
    color: colors.danger,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyState: {
    marginTop: 16,
    gap: 12,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyCopy: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  pressable: {
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.95,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  deviceSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
});

function formatMetricValue(value: number, unit: string, hasLiveData: boolean) {
  if (!hasLiveData) {
    return "N/A";
  }

  return `${value.toFixed(1)}${unit}`;
}