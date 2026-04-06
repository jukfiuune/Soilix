import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../components/AppButton";
import { AppTextInput } from "../components/AppTextInput";
import { Screen } from "../components/Screen";
import { SectionCard } from "../components/SectionCard";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <MaterialCommunityIcons name="leaf" size={38} color="#ffffff" />
        </View>
        <Text style={styles.title}>Soilix</Text>
        <Text style={styles.subtitle}>Monitor your garden from anywhere.</Text>
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
          placeholder="Enter your password"
          secureTextEntry
        />
        <AppButton title="Log In" onPress={handleLogin} loading={loading} />
      </SectionCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <AppButton
          title="Create Account"
          onPress={() => navigation.navigate("SignUp")}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: "center",
    gap: 22,
  },
  hero: {
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: "#17351d",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
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
  footer: {
    gap: 10,
  },
  footerText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
  },
});
