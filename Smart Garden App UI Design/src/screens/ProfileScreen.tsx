import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AppButton } from "../components/AppButton";
import { ConfirmModal } from "../components/ConfirmModal";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { MainTabParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = BottomTabScreenProps<MainTabParamList, "Profile">;

export function ProfileScreen(_: Props) {
  const { user, logout, deleteAccount } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    Alert.alert("Logged out", "Your demo session has ended.");
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteAccount();
    setLoading(false);
    setDeleteModalVisible(false);
    Alert.alert("Account deleted", "The demo account has been removed.");
  };

  return (
    <>
      <Screen>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account and garden app settings.</Text>
        </View>

        <SectionCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-outline" size={34} color="#ffffff" />
          </View>
          <View style={styles.infoWrap}>
            <Text style={styles.infoLabel}>Logged in as</Text>
            <Text style={styles.infoValue}>{user?.email ?? "No user"}</Text>
          </View>
        </SectionCard>

        <SectionCard style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <View style={styles.leafBadge}>
              <MaterialCommunityIcons name="leaf" size={24} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.appName}>SmartGarden Native</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutCopy}>
            Track soil and climate conditions in a mobile-first experience built for React Native.
          </Text>
        </SectionCard>

        <View style={styles.actions}>
          <AppButton title="Log Out" onPress={handleLogout} variant="secondary" />
          <AppButton title="Delete Account" onPress={() => setDeleteModalVisible(true)} variant="danger" />
        </View>
      </Screen>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Account"
        description="Delete your account and clear the demo profile session? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={loading}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  infoWrap: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  infoValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  aboutCard: {
    gap: 14,
  },
  aboutHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  leafBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  appVersion: {
    marginTop: 4,
    color: colors.textMuted,
  },
  aboutCopy: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 18,
  },
});
