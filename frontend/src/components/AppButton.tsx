import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";

type Variant = "primary" | "secondary" | "outline" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  textStyle,
}: Props) {
  const palette = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        palette.button,
        pressed && !disabled && !loading ? styles.pressed : null,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text.color} />
      ) : (
        <Text style={[styles.text, palette.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const variantStyles: Record<Variant, { button: ViewStyle; text: TextStyle }> = {
  primary: {
    button: { backgroundColor: colors.primary },
    text: { color: "#ffffff" },
  },
  secondary: {
    button: { backgroundColor: "#eef4ef" },
    text: { color: colors.text },
  },
  outline: {
    button: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: colors.border },
    text: { color: colors.text },
  },
  danger: {
    button: { backgroundColor: colors.danger },
    text: { color: "#ffffff" },
  },
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
