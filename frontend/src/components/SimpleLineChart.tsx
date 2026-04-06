import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { colors } from "../theme/colors";

type Point = {
  label: string;
  value: number;
};

type Props = {
  data: Point[];
  color: string;
  unit: string;
};

export function SimpleLineChart({ data, color, unit }: Props) {
  if (data.length === 0) {
    return (
      <View style={[styles.frame, styles.empty]}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const width = 300;
  const height = 180;
  const padding = 18;
  const values = data.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const path = data
    .map((point, index) => {
      const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
      const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const lastPoint = data[data.length - 1];
  const labelIndexes = Array.from(new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]));

  return (
    <View style={styles.frame}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1="18" y1="24" x2="282" y2="24" stroke="#e8efe9" strokeWidth="1" />
        <Line x1="18" y1="90" x2="282" y2="90" stroke="#e8efe9" strokeWidth="1" />
        <Line x1="18" y1="156" x2="282" y2="156" stroke="#e8efe9" strokeWidth="1" />
        <Path d={path} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>

      <View style={styles.chartFooter}>
        {labelIndexes.map((index) => (
          <Text key={index} style={styles.axisLabel}>
            {data[index]?.label}
          </Text>
        ))}
      </View>

      <Text style={styles.currentValue}>
        Latest: {lastPoint.value}
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 24,
    backgroundColor: "#f9fcf9",
    borderWidth: 1,
    borderColor: "#edf3ee",
    padding: 10,
  },
  empty: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 8,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  currentValue: {
    marginTop: 10,
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
    paddingHorizontal: 8,
  },
});
