import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { useAppColors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: Props) {
  const c = useAppColors();
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
      Alert.alert("Account created", "You can log in with your new account now.", [
        { text: "OK", onPress: () => navigation.navigate("Auth") },
      ]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>Start monitoring your plants today.</Text>
      </View>

      <SectionCard style={styles.card}>
        {error ? <Text style={[styles.error, { backgroundColor: c.dangerSurface, color: c.danger }]}>{error}</Text> : null}
        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
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

      <View style={styles.footer}>
        <AppButton title="Back to Login" onPress={() => navigation.goBack()} variant="secondary" />
      </View>
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
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    gap: 16,
  },
  error: {
    borderRadius: 16,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  footer: {
    gap: 10,
  },
});
