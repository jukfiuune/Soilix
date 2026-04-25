import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppColors } from "../theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onScanQR: () => void;
  onTypeManually: () => void;
};

export function AddDeviceSheet({ visible, onClose, onScanQR, onTypeManually }: Props) {
  const c = useAppColors();
  const translateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const actionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 180,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleScanQR = () => {
    onClose();
    actionTimeoutRef.current = setTimeout(onScanQR, 260);
  };

  const handleTypeManually = () => {
    onClose();
    actionTimeoutRef.current = setTimeout(onTypeManually, 260);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: c.overlay }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: c.card, transform: [{ translateY }] },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: c.border }]} />

        <Text style={[styles.title, { color: c.text }]}>Connect a Device</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Add your Soilix sensor to start monitoring.
        </Text>

        <SheetOption
          icon="qrcode-scan"
          label="Scan QR Code"
          description="Point your camera at the QR code on the device"
          onPress={handleScanQR}
          c={c}
        />
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <SheetOption
          icon="pencil-outline"
          label="Enter ID Manually"
          description="Type in the device UUID from the label"
          onPress={handleTypeManually}
          c={c}
        />
      </Animated.View>
    </Modal>
  );
}

type SheetOptionProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  c: ReturnType<typeof useAppColors>;
};

function SheetOption({ icon, label, description, onPress, c }: SheetOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.optionIcon, { backgroundColor: `${c.primary}1A` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={c.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, { color: c.text }]}>{label}</Text>
        <Text style={[styles.optionDesc, { color: c.textMuted }]}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={c.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 14,
    gap: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    gap: 3,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginHorizontal: -24,
  },
});
