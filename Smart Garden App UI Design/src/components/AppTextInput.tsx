import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../theme/colors";

type Props = TextInputProps & {
  label: string;
  helperText?: string;
};

export function AppTextInput({ label, helperText, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#93a998"
        style={styles.input}
        showSoftInputOnFocus
        {...props}
      />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  input: {
    backgroundColor: "#f9fcf9",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
