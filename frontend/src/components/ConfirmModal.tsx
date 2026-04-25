import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { AppButton } from "./AppButton";
import { useAppColors } from "../theme/colors";

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
  const c = useAppColors();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          <Text style={[styles.description, { color: c.textMuted }]}>{description}</Text>
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
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  action: {
    flex: 1,
  },
});
