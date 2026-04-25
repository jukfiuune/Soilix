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
import { useAppColors } from "../theme/colors";

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
  const c = useAppColors();

  const variantStyles: Record<Variant, { button: ViewStyle; text: TextStyle }> = {
    primary: {
      button: { backgroundColor: c.primary },
      text: { color: "#ffffff" },
    },
    secondary: {
      button: { backgroundColor: c.cardAlt },
      text: { color: c.text },
    },
    outline: {
      button: { backgroundColor: "transparent", borderWidth: 1, borderColor: c.border },
      text: { color: c.text },
    },
    danger: {
      button: { backgroundColor: c.danger },
      text: { color: "#ffffff" },
    },
  };

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
        <ActivityIndicator color={palette.text.color as string} />
      ) : (
        <Text style={[styles.text, palette.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

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
