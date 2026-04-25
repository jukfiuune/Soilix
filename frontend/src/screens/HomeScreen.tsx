import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { AddDeviceSheet } from "../components/AddDeviceSheet";
import { AppButton } from "../components/AppButton";
import { MetricPill } from "../components/MetricPill";
import { PromptModal } from "../components/PromptModal";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useDevices } from "../context/DeviceContext";
import { MainTabParamList, RootStackParamList } from "../navigation/types";
import { useAppColors } from "../theme/colors";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const c = useAppColors();
  const { devices, loading, error, connectDevice, refreshDevices } = useDevices();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [deviceIdModalVisible, setDeviceIdModalVisible] = useState(false);
  const [deviceNameModalVisible, setDeviceNameModalVisible] = useState(false);
  const [pendingDeviceId, setPendingDeviceId] = useState("");
  const [creating, setCreating] = useState(false);

  // Camera state
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("Scan Soilix QR Code");
  const scannedRef = useRef(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const handleStartScan = async () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
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

  const prepareDeviceConnection = (deviceId: string) => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    const trimmed = deviceId.trim();
    if (!trimmed) {
      Alert.alert("Missing ID", "Please enter a valid device ID.");
      return;
    }

    setPendingDeviceId(trimmed);
    setDeviceIdModalVisible(false);
    setDeviceNameModalVisible(true);
  };

  const handleConnectDevice = async (deviceName: string) => {
    if (!pendingDeviceId) {
      Alert.alert("Missing ID", "Please enter a valid device ID.");
      return;
    }

    setCreating(true);

    try {
      const trimmedName = deviceName.trim();
      const message = await connectDevice(pendingDeviceId, trimmedName || undefined);
      setDeviceNameModalVisible(false);
      setIsScanning(false);
      setPendingDeviceId("");
      Alert.alert("Device Connected", message);
    } catch (err) {
      Alert.alert("Could not connect device", (err as Error).message);
      scannedRef.current = false;
    } finally {
      setCreating(false);
    }
  };

  // Full-screen QR camera view
  if (isScanning) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => {
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data);
            if (!isValidUUID || scannedRef.current) return;
            scannedRef.current = true;
            setScanMessage(`Found ${data}`);
            scanTimeoutRef.current = setTimeout(() => {
              setIsScanning(false);
              prepareDeviceConnection(data);
            }, 900);
          }}
        />
        <View style={[styles.cameraOverlay, { backgroundColor: c.overlay }]}>
          <Text style={styles.cameraText}>{scanMessage}</Text>
          <AppButton
            title="Cancel Scan"
            onPress={() => {
              if (scanTimeoutRef.current) {
                clearTimeout(scanTimeoutRef.current);
                scanTimeoutRef.current = null;
              }
              scannedRef.current = false;
              setIsScanning(false);
            }}
            variant="secondary"
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <Screen>
        <View style={styles.header}>
          <View>
            <Text style={[styles.eyebrow, { color: c.primary }]}>Soilix</Text>
            <Text style={[styles.title, { color: c.text }]}>Your devices</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Profile")}
            style={[styles.headerBadge, { backgroundColor: c.card }]}
          >
            <MaterialCommunityIcons name="account-outline" size={22} color={c.primary} />
          </Pressable>
        </View>

        {loading ? (
          <Text style={[styles.helperText, { color: c.textMuted }]}>Loading your connected devices...</Text>
        ) : null}
        {error ? (
          <Text style={[styles.errorText, { backgroundColor: c.dangerSurface, color: c.danger }]}>
            {error}
          </Text>
        ) : null}
        {!loading && !error && !devices.length ? (
          <View style={[styles.emptyState, { backgroundColor: c.card }]}>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No connected devices yet</Text>
            <Text style={[styles.emptyCopy, { color: c.textMuted }]}>
              Tap the + button to connect your first Soilix device.
            </Text>
            <AppButton title="Refresh" onPress={() => void refreshDevices()} variant="secondary" />
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
                    <Text style={[styles.deviceName, { color: c.text }]}>{device.name}</Text>
                    <Text style={[styles.deviceSub, { color: c.textMuted }]}>
                      {device.hasLiveData ? "Live environmental readings" : "No live readings yet"}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={c.textMuted} />
                </View>

                <MetricPill icon="thermometer" label="Air Temperature" value={formatMetricValue(device.readings.airTemp, "°C", device.hasLiveData)} tint="#f28b37" />
                <MetricPill icon="water-percent" label="Air Humidity" value={formatMetricValue(device.readings.airHumidity, "%", device.hasLiveData)} tint="#4d96d8" />
                <MetricPill icon="gauge" label="Air Pressure" value={formatMetricValue(device.readings.airPressure, " hPa", device.hasLiveData)} tint="#9566d8" />
                <MetricPill icon="sprout" label="Soil Humidity" value={formatMetricValue(device.readings.soilHumidity, "%", device.hasLiveData)} tint="#4aaf5d" />
                <MetricPill icon="thermometer-lines" label="Soil Temperature" value={formatMetricValue(device.readings.soilTemp, "°C", device.hasLiveData)} tint="#c88f31" />
                <MetricPill icon="weather-windy" label="Wind Speed" value={formatMetricValue(device.readings.windSpeed, " m/s", device.hasLiveData)} tint="#5aa8c4" />
              </SectionCard>
            </Pressable>
          ))}
        </View>

        {/* Spacer so last card isn't hidden behind FAB */}
        <View style={styles.fabSpacer} />
      </Screen>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: c.primary, shadowColor: c.shadow },
          pressed && styles.fabPressed,
        ]}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#ffffff" />
      </Pressable>

      <AddDeviceSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onScanQR={handleStartScan}
        onTypeManually={() => setDeviceIdModalVisible(true)}
      />

      <PromptModal
        visible={deviceIdModalVisible}
        title="Connect Existing Device"
        description="Enter a valid device ID. The device can be connected only if it currently has no owner."
        placeholder="Device UUID"
        confirmLabel="Continue"
        initialValue=""
        loading={creating}
        onCancel={() => setDeviceIdModalVisible(false)}
        onConfirm={prepareDeviceConnection}
      />

      <PromptModal
        visible={deviceNameModalVisible}
        title="Name Your Device"
        description="Add an optional display name now. You can also rename it later from the device details screen."
        placeholder="e.g. Greenhouse North"
        confirmLabel="Connect"
        initialValue=""
        loading={creating}
        onCancel={() => {
          setDeviceNameModalVisible(false);
          setPendingDeviceId("");
          scannedRef.current = false;
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
          }
        }}
        onConfirm={handleConnectDevice}
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
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
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
  },
  list: {
    gap: 14,
    marginTop: 16,
  },
  fabSpacer: {
    height: 100,
  },
  helperText: {
    marginTop: 14,
    fontSize: 14,
  },
  errorText: {
    marginTop: 14,
    borderRadius: 16,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emptyState: {
    marginTop: 16,
    gap: 12,
    borderRadius: 24,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  emptyCopy: {
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
  },
  deviceSub: {
    marginTop: 4,
    fontSize: 13,
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
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});

function formatMetricValue(value: number, unit: string, hasLiveData: boolean) {
  if (!hasLiveData) return "N/A";
  return `${value.toFixed(1)}${unit}`;
}
