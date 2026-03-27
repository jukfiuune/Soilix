import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.actions}>
            <AppButton title={cancelLabel} onPress={onCancel} variant="outline" style={styles.action} />
            <AppButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={confirmVariant}
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
    backgroundColor: "rgba(14, 24, 18, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
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
