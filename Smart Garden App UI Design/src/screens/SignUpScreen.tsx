import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      await signup(email, password, confirmPassword);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start monitoring your plants today.</Text>
      </View>

      <SectionCard style={styles.card}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
        />
        <AppTextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat the password"
          secureTextEntry
        />
        <AppButton title="Sign Up" onPress={handleSignUp} loading={loading} />
      </SectionCard>

      <AppButton title="Back to Login" onPress={() => navigation.goBack()} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    gap: 22,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  card: {
    gap: 16,
  },
  error: {
    borderRadius: 16,
    backgroundColor: "#fdeceb",
    color: colors.danger,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
