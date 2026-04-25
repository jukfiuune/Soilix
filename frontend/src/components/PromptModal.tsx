import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { AppButton } from "./AppButton";
import { useAppColors } from "../theme/colors";

type Props = {
  visible: boolean;
  title: string;
  description: string;
  placeholder: string;
  confirmLabel: string;
  initialValue?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

export function PromptModal({
  visible,
  title,
  description,
  placeholder,
  confirmLabel,
  initialValue = "",
  loading,
  onCancel,
  onConfirm,
}: Props) {
  const c = useAppColors();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setValue(initialValue);
    }
  }, [initialValue, visible]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          <Text style={[styles.description, { color: c.textMuted }]}>{description}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={c.textMuted}
            style={[
              styles.input,
              {
                borderColor: c.border,
                color: c.text,
                backgroundColor: c.inputBg,
              },
            ]}
            autoFocus
          />
          <View style={styles.actions}>
            <AppButton title="Cancel" onPress={onCancel} variant="outline" style={styles.action} />
            <AppButton
              title={confirmLabel}
              onPress={() => onConfirm(value)}
              loading={loading}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
});
