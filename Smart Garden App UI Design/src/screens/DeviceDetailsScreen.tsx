import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { ConfirmModal } from "../components/ConfirmModal";
import { IllustratedGarden } from "../components/IllustratedGarden";
import { MetricPill } from "../components/MetricPill";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useDevices } from "../context/DeviceContext";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "DeviceDetails">;

export function DeviceDetailsScreen({ navigation, route }: Props) {
  const { getDevice, removeDevice } = useDevices();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const device = getDevice(route.params.deviceId);

  if (!device) {
    return (
      <Screen contentStyle={styles.emptyContent}>
        <Text style={styles.emptyTitle}>Device not found</Text>
        <AppButton title="Back to Home" onPress={() => navigation.navigate("Main", { screen: "Home" })} />
      </Screen>
    );
  }

  const handleDisconnect = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    removeDevice(device.id);
    setLoading(false);
    setModalVisible(false);
    navigation.navigate("Main", { screen: "Home" });
  };

  return (
    <>
      <Screen>
        <View style={styles.topRow}>
          <AppButton title="Back" onPress={() => navigation.goBack()} variant="secondary" style={styles.backButton} />
          <View style={styles.topActions}>
            <Pressable onPress={() => navigation.navigate("Main", { screen: "Profile" })} style={styles.iconChip}>
              <MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} />
            </Pressable>
            <View style={styles.iconChip}>
              <MaterialCommunityIcons name="dots-horizontal" size={22} color={colors.primary} />
            </View>
          </View>
        </View>

        <SectionCard style={styles.titleCard}>
          <Text style={styles.deviceLabel}>Connected Device</Text>
          <Text style={styles.deviceTitle}>{device.name}</Text>
          <Text style={styles.deviceCopy}>Realtime greenhouse and soil health overview.</Text>
        </SectionCard>

        <SectionCard style={styles.metricsCard}>
          <MetricPill icon="gauge" label="Air Pressure" value={`${device.readings.airPressure} hPa`} tint="#9566d8" />
          <MetricPill icon="water-percent" label="Air Humidity" value={`${device.readings.airHumidity}%`} tint="#4d96d8" />
          <MetricPill icon="sprout" label="Soil Humidity" value={`${device.readings.soilHumidity}%`} tint="#4aaf5d" />
          <MetricPill icon="thermometer" label="Air Temperature" value={`${device.readings.airTemp}C`} tint="#f28b37" />
          <MetricPill icon="thermometer-lines" label="Soil Temperature" value={`${device.readings.soilTemp}C`} tint="#c88f31" />
        </SectionCard>

        <IllustratedGarden readings={device.readings} />

        <View style={styles.actions}>
          <AppButton
            title="View Statistics"
            onPress={() => navigation.navigate("Statistics", { deviceId: device.id })}
          />
          <AppButton
            title="Disconnect Device"
            onPress={() => setModalVisible(true)}
            variant="outline"
          />
        </View>
      </Screen>

      <ConfirmModal
        visible={modalVisible}
        title="Disconnect Device"
        description={`Disconnect ${device.name}? You will stop receiving demo sensor readings for it.`}
        confirmLabel="Disconnect"
        confirmVariant="danger"
        loading={loading}
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDisconnect}
      />
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
  backButton: {
    minHeight: 44,
    paddingHorizontal: 16,
  },
  iconChip: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  topActions: {
    flexDirection: "row",
    gap: 10,
  },
  titleCard: {
    marginBottom: 14,
  },
  deviceLabel: {
    color: colors.primary,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    fontWeight: "700",
  },
  deviceTitle: {
    marginTop: 8,
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  deviceCopy: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 21,
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
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
});
