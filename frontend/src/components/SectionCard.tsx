import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useAppColors } from "../theme/colors";

type Props = React.PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function SectionCard({ children, style }: Props) {
  const c = useAppColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, shadowColor: c.shadow }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
