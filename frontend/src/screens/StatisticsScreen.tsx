import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { SimpleLineChart } from "../components/SimpleLineChart";
import { apiRequest, getBearerAuthHeaders } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useDevices } from "../context/DeviceContext";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Statistics">;
type Metric = "airTemp" | "airHumidity" | "airPressure" | "soilHumidity" | "soilTemp";
type TimeRange = "10 minutes" | "30 minutes" | "1 hour" | "1 day";
type HistoricalDataPoint = {
  timestamp: string;
  value: number;
};
type BackendReading = {
  recorded_at: string;
  air_temp_c: number;
  air_humidity_pct: number;
  air_pressure_hpa: number;
  soil_humidity_pct: number;
  soil_temp_c: number;
};
type HistoryResponse = {
  readings: BackendReading[];
};

const metricConfig: Record<Metric, { label: string; unit: string; color: string }> = {
  airTemp: { label: "Air Temperature", unit: "C", color: "#f28b37" },
  airHumidity: { label: "Air Humidity", unit: "%", color: "#4d96d8" },
  airPressure: { label: "Air Pressure", unit: " hPa", color: "#9566d8" },
  soilHumidity: { label: "Soil Humidity", unit: "%", color: "#4aaf5d" },
  soilTemp: { label: "Soil Temperature", unit: "C", color: "#c88f31" },
};

const timeRanges: TimeRange[] = ["10 minutes", "30 minutes", "1 hour", "1 day"];
const metricFieldMap: Record<Metric, keyof BackendReading> = {
  airTemp: "air_temp_c",
  airHumidity: "air_humidity_pct",
  airPressure: "air_pressure_hpa",
  soilHumidity: "soil_humidity_pct",
  soilTemp: "soil_temp_c",
};

export function StatisticsScreen({ navigation, route }: Props) {
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
      if (!device || !user?.accessToken) {
        setReadings([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await apiRequest<HistoryResponse>(
          `/api/devices/${device.id}/history?range=${encodeURIComponent(range)}`,
          {
            headers: getBearerAuthHeaders(user.accessToken),
          },
        );

        setReadings([...response.readings].reverse());
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
      .filter((reading) => reading.recorded_at && typeof reading[field] === "number")
      .map((reading) => ({
        timestamp: reading.recorded_at,
        value: Number(reading[field]),
      }));
  }, [metric, readings]);

  const stats = useMemo(() => {
    const values = data.map((item) => item.value);
    if (!values.length) {
      return null;
    }

    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

    return {
      min: Math.min(...values),
      avg,
      max: Math.max(...values),
    };
  }, [data]);

  if (!device) {
    return (
      <Screen contentStyle={styles.emptyContent}>
        <Text style={styles.emptyTitle}>Statistics unavailable</Text>
        <AppButton title="Back to Home" onPress={() => navigation.navigate("Main", { screen: "Home" })} />
      </Screen>
    );
  }

  const config = metricConfig[metric];
  const chartData = data.map((item) => ({
    label: formatLabel(item.timestamp, range),
    value: item.value,
  }));

  return (
    <Screen>
      <AppButton title="Back" onPress={() => navigation.goBack()} variant="secondary" style={styles.backButton} />

      <SectionCard style={styles.heroCard}>
        <Text style={styles.heroTitle}>Statistics</Text>
        <Text style={styles.heroSub}>{device.name}</Text>
      </SectionCard>

      <SectionCard style={styles.selectorCard}>
        <Text style={styles.sectionLabel}>Time range</Text>
        <View style={styles.segmentRow}>
          {timeRanges.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRange(item)}
              style={[styles.segment, range === item ? styles.segmentActive : null]}
            >
              <Text style={[styles.segmentText, range === item ? styles.segmentTextActive : null]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.metricLabel]}>{config.label}</Text>
        {loading ? <Text style={styles.infoText}>Loading history...</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!loading && !error && !chartData.length ? <Text style={styles.infoText}>No historical readings yet.</Text> : null}
        <SimpleLineChart data={chartData} color={config.color} unit={config.unit} />
      </SectionCard>

      <View style={styles.metricGrid}>
        {(Object.keys(metricConfig) as Metric[]).map((item) => (
          <Pressable
            key={item}
            onPress={() => setMetric(item)}
            style={[styles.metricButton, metric === item ? styles.metricButtonActive : null]}
          >
            <Text style={[styles.metricButtonText, metric === item ? styles.metricButtonTextActive : null]}>
              {metricConfig[item].label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Min" value={stats?.min ?? null} unit={config.unit} />
        <StatCard label="Avg" value={stats?.avg ?? null} unit={config.unit} />
        <StatCard label="Max" value={stats?.max ?? null} unit={config.unit} />
      </View>
    </Screen>
  );
}

function StatCard({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <SectionCard style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value === null ? "N/A" : value.toFixed(1)}
        {value === null ? null : <Text style={styles.statUnit}>{unit}</Text>}
      </Text>
    </SectionCard>
  );
}

function formatLabel(timestamp: string, range: TimeRange) {
  const date = new Date(timestamp);

  if (range !== "1 day") {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

  return `${date.getDate()}/${date.getMonth() + 1} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroCard: {
    marginBottom: 14,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  heroSub: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 15,
  },
  selectorCard: {
    gap: 14,
  },
  sectionLabel: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  metricLabel: {
    marginTop: 4,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  segment: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#edf5ef",
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#ffffff",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  metricButton: {
    width: "48.5%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  metricButtonActive: {
    backgroundColor: "#dff2e4",
    borderWidth: 1,
    borderColor: "#9ed2aa",
  },
  metricButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  metricButtonTextActive: {
    color: colors.primaryDark,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  statUnit: {
    color: colors.textMuted,
    fontSize: 11,
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
