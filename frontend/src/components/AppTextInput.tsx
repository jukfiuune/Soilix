import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useAppColors } from "../theme/colors";

type Props = TextInputProps & {
  label: string;
  helperText?: string;
};

export function AppTextInput({ label, helperText, ...props }: Props) {
  const c = useAppColors();

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <TextInput
        placeholderTextColor={c.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: c.inputBg,
            borderColor: c.border,
            color: c.text,
          },
        ]}
        showSoftInputOnFocus
        {...props}
      />
      {helperText ? <Text style={[styles.helper, { color: c.textMuted }]}>{helperText}</Text> : null}
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  helper: {
    fontSize: 12,
  },
});
