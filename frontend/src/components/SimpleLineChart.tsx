import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { useAppColors } from "../theme/colors";

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
  const c = useAppColors();

  if (data.length === 0) {
    return (
      <View style={[styles.frame, styles.empty, { backgroundColor: c.inputBg, borderColor: c.border }]}>
        <Text style={[styles.emptyText, { color: c.textMuted }]}>No data available</Text>
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
    <View style={[styles.frame, { backgroundColor: c.inputBg, borderColor: c.border }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1="18" y1="24" x2="282" y2="24" stroke={c.border} strokeWidth="1" />
        <Line x1="18" y1="90" x2="282" y2="90" stroke={c.border} strokeWidth="1" />
        <Line x1="18" y1="156" x2="282" y2="156" stroke={c.border} strokeWidth="1" />
        <Path d={path} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>

      <View style={styles.chartFooter}>
        {labelIndexes.map((index) => (
          <Text key={index} style={[styles.axisLabel, { color: c.textMuted }]}>
            {data[index]?.label}
          </Text>
        ))}
      </View>

      <Text style={[styles.currentValue, { color: c.text }]}>
        Latest: {lastPoint.value}
        {unit}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 10,
  },
  empty: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontWeight: "600",
  },
  chartFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
    paddingHorizontal: 8,
  },
  axisLabel: {
    fontSize: 12,
  },
  currentValue: {
    marginTop: 10,
    fontWeight: "700",
    fontSize: 13,
    paddingHorizontal: 8,
  },
});
