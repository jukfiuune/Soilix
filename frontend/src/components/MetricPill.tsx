import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  tint: string;
};

export function MetricPill({ icon, label, value, tint }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
        <MaterialCommunityIcons name={icon} size={18} color={tint} />
      </View>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
});
