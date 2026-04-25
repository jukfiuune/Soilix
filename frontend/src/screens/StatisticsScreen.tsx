import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { SimpleLineChart } from "../components/SimpleLineChart";
import { apiRequest, getBearerAuthHeaders } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useDevices } from "../context/DeviceContext";
import { RootStackParamList } from "../navigation/types";
import { useAppColors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Statistics">;
type Metric = "airTemp" | "airHumidity" | "airPressure" | "soilHumidity" | "soilTemp" | "windSpeed";
type TimeRange =
  | "10 minutes"
  | "30 minutes"
  | "1 hour"
  | "1 day"
  | "1 week"
  | "1 month"
  | "3 months"
  | "1 year";
type HistoricalDataPoint = { timestamp: string; value: number };
type BackendReading = {
  recorded_at: string;
  air_temp_c: number;
  air_humidity_pct: number;
  air_pressure_hpa: number;
  soil_humidity_pct: number;
  soil_temp_c: number;
  wind_speed_ms: number;
};
type HistoryResponse = { readings: BackendReading[] };

const metricConfig: Record<Metric, { label: string; unit: string; color: string }> = {
  airTemp:      { label: "Air Temperature", unit: "°C",  color: "#f28b37" },
  airHumidity:  { label: "Air Humidity",    unit: "%",   color: "#4d96d8" },
  airPressure:  { label: "Air Pressure",    unit: " hPa",color: "#9566d8" },
  soilHumidity: { label: "Soil Humidity",   unit: "%",   color: "#4aaf5d" },
  soilTemp:     { label: "Soil Temperature",unit: "°C",  color: "#c88f31" },
  windSpeed:    { label: "Wind Speed",      unit: " m/s",color: "#5aa8c4" },
};

const timeRanges: TimeRange[] = [
  "10 minutes",
  "30 minutes",
  "1 hour",
  "1 day",
  "1 week",
  "1 month",
  "3 months",
  "1 year",
];
const metricFieldMap: Record<Metric, keyof BackendReading> = {
  airTemp:      "air_temp_c",
  airHumidity:  "air_humidity_pct",
  airPressure:  "air_pressure_hpa",
  soilHumidity: "soil_humidity_pct",
  soilTemp:     "soil_temp_c",
  windSpeed:    "wind_speed_ms",
};

export function StatisticsScreen({ navigation, route }: Props) {
  const c = useAppColors();
  const { user } = useAuth();
  const { getDevice } = useDevices();
  const [metric, setMetric] = useState<Metric>("airTemp");
  const [range, setRange] = useState<TimeRange>("1 hour");
  const [readings, setReadings] = useState<BackendReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const device = getDevice(route.params.deviceId);

  useEffect(() => {
    const loadHistory = async () => {
      if (!device || !user?.accessToken) { setReadings([]); setError(""); return; }
      setLoading(true);
      setError("");
      try {
        const response = await apiRequest<HistoryResponse>(
          `/api/devices/${device.id}/history?range=${encodeURIComponent(range)}`,
          { headers: getBearerAuthHeaders(user.accessToken) },
        );
        setReadings(response.readings);
      } catch (err) {
        setReadings([]);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void loadHistory();
  }, [device, range, user?.accessToken]);

  const data = useMemo<HistoricalDataPoint[]>(() => {
    const field = metricFieldMap[metric];
    return readings
      .filter((r) => r.recorded_at && typeof r[field] === "number")
      .map((r) => ({ timestamp: r.recorded_at, value: Number(r[field]) }));
  }, [metric, readings]);

  const stats = useMemo(() => {
    const values = data.map((item) => item.value);
    if (!values.length) return null;
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return { min: Math.min(...values), avg, max: Math.max(...values) };
  }, [data]);

  if (!device) {
    return (
      <Screen contentStyle={styles.emptyContent}>
        <Text style={[styles.emptyTitle, { color: c.text }]}>Statistics unavailable</Text>
        <AppButton title="Back to Home" onPress={() => navigation.navigate("Main", { screen: "Home" })} />
      </Screen>
    );
  }

  const config = metricConfig[metric];
  const chartData = data.map((item) => ({ label: formatLabel(item.timestamp, range), value: item.value }));

  return (
    <Screen>
      {/* Compact back chip */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={({ pressed }) => [styles.backChip, { backgroundColor: c.card }, pressed && styles.chipPressed]}
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color={c.primary} />
      </Pressable>

      <SectionCard style={styles.heroCard}>
        <Text style={[styles.heroTitle, { color: c.text }]}>Statistics</Text>
        <Text style={[styles.heroSub, { color: c.textMuted }]}>{device.name}</Text>
      </SectionCard>

      <SectionCard style={styles.selectorCard}>
        <Text style={[styles.sectionLabel, { color: c.text }]}>Time range</Text>
        <View style={styles.segmentRow}>
          {timeRanges.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRange(item)}
              style={[
                styles.segment,
                { backgroundColor: range === item ? c.primary : c.cardAlt },
              ]}
            >
              <Text style={[styles.segmentText, { color: range === item ? "#ffffff" : c.textMuted }]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.metricLabel, { color: c.text }]}>{config.label}</Text>
        {loading ? <Text style={[styles.infoText, { color: c.textMuted }]}>Loading history...</Text> : null}
        {error ? <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text> : null}
        {!loading && !error && !chartData.length ? (
          <Text style={[styles.infoText, { color: c.textMuted }]}>No historical readings yet.</Text>
        ) : null}
        <SimpleLineChart data={chartData} color={config.color} unit={config.unit} />
      </SectionCard>

      <View style={styles.metricGrid}>
        {(Object.keys(metricConfig) as Metric[]).map((item) => (
          <Pressable
            key={item}
            onPress={() => setMetric(item)}
            style={[
              styles.metricButton,
              {
                backgroundColor: metric === item ? `${c.primary}22` : c.card,
                borderWidth: metric === item ? 1 : 0,
                borderColor: metric === item ? c.primary : "transparent",
              },
            ]}
          >
            <Text style={[styles.metricButtonText, { color: metric === item ? c.primary : c.text }]}>
              {metricConfig[item].label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Min" value={stats?.min ?? null} unit={config.unit} c={c} />
        <StatCard label="Avg" value={stats?.avg ?? null} unit={config.unit} c={c} />
        <StatCard label="Max" value={stats?.max ?? null} unit={config.unit} c={c} />
      </View>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  unit,
  c,
}: {
  label: string;
  value: number | null;
  unit: string;
  c: ReturnType<typeof useAppColors>;
}) {
  return (
    <SectionCard style={styles.statCard}>
      <Text style={[styles.statLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.text }]}>
        {value === null ? "N/A" : value.toFixed(1)}
        {value === null ? null : <Text style={[styles.statUnit, { color: c.textMuted }]}>{unit}</Text>}
      </Text>
    </SectionCard>
  );
}

function formatLabel(timestamp: string, range: TimeRange) {
  const date = new Date(timestamp);

  if (range === "10 minutes" || range === "30 minutes" || range === "1 hour") {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  if (range === "1 day" || range === "1 week") {
    return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
}

const styles = StyleSheet.create({
  backChip: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  chipPressed: { opacity: 0.7 },
  heroCard:     { marginBottom: 14 },
  heroTitle:    { fontSize: 28, fontWeight: "800" },
  heroSub:      { marginTop: 6, fontSize: 15 },
  selectorCard: { gap: 14 },
  sectionLabel: { fontWeight: "700", fontSize: 15 },
  metricLabel:  { marginTop: 4 },
  infoText:     { fontSize: 14 },
  errorText:    { fontSize: 14, fontWeight: "600" },
  segmentRow:   { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segment:      { width: "23%", borderRadius: 14, paddingVertical: 10, alignItems: "center" },
  segmentText:  { fontWeight: "700", fontSize: 13 },
  metricGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  metricButton: { width: "48.5%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 14 },
  metricButtonText: { fontWeight: "700", fontSize: 13 },
  statsRow:     { flexDirection: "row", gap: 10, marginTop: 14, paddingBottom: 24 },
  statCard:     { flex: 1, paddingVertical: 16, paddingHorizontal: 12 },
  statLabel:    { fontSize: 12, marginBottom: 6 },
  statValue:    { fontWeight: "800", fontSize: 18 },
  statUnit:     { fontSize: 11 },
  emptyContent: { justifyContent: "center", gap: 16 },
  emptyTitle:   { fontSize: 24, fontWeight: "800", textAlign: "center" },
});
