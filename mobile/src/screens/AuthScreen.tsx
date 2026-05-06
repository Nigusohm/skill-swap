import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { theme } from "../theme";

type AuthScreenProps = {
  initialMode?: "login" | "register";
  onBack?: () => void;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode = "login", onBack }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanSchool = school.trim();

    if (mode === "register" && !cleanName) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setBusy(true);
      if (mode === "login") {
        await login(cleanEmail, password);
      } else {
        await register(cleanName, cleanEmail, password, cleanSchool);
      }
    } catch (error) {
      const isServerUnavailable =
        axios.isAxiosError(error) &&
        (!error.response ||
          error.response.status >= 500 ||
          error.code === "ECONNABORTED" ||
          (typeof error.response.data === "string" && error.response.data.toLowerCase().includes("not ready")));

      if (isServerUnavailable) {
        Alert.alert("Server not ready", "Backend is waking up or deploying on Render. Wait 30-60 seconds and try again.");
      } else {
        Alert.alert("Authentication failed", "Please check your details and try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.bgBubbleA} />
      <View style={styles.bgBubbleB} />
      <View style={styles.bgBubbleC} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {onBack ? (
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={16} color={theme.colors.text} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.title}>SkillSwap</Text>
          <Text style={styles.subtitle}>A professional student skill exchange network.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.formTitle}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
          <Text style={styles.formSubtitle}>
            {mode === "login" ? "Welcome back. Continue your learning journey." : "Create your profile and start exchanging skills."}
          </Text>

          {mode === "register" && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color="#67839F" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#8DA1B6"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
              <Text style={styles.label}>School / University</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="school-outline" size={18} color="#67839F" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your school"
                  placeholderTextColor="#8DA1B6"
                  value={school}
                  onChangeText={setSchool}
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color="#67839F" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#8DA1B6"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#67839F" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#8DA1B6"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((current) => !current)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#56708A" />
            </Pressable>
          </View>

          <Pressable style={styles.action} onPress={submit} disabled={busy}>
            <Text style={styles.actionText}>{busy ? "Please wait..." : mode === "register" ? "Create Account" : "Sign In"}</Text>
          </Pressable>

          {mode === "register" ? (
            <Pressable style={styles.switchHint} onPress={() => setMode("login")}>
              <Text style={styles.hintText}>
                Already have an account? <Text style={styles.hintAction}>Sign in</Text>
              </Text>
            </Pressable>
          ) : (
            <Pressable style={styles.switchHint} onPress={() => setMode("register")}>
              <Text style={styles.hintText}>
                New to SkillSwap? <Text style={styles.hintAction}>Create account</Text>
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: theme.spacing.lg
  },
  backBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderColor: theme.colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999
  },
  backText: {
    color: theme.colors.text,
    fontWeight: "700"
  },
  bgBubbleA: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "#D8F1F9",
    top: -20,
    right: -80
  },
  bgBubbleB: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: "#D9F7EA",
    bottom: -40,
    left: -70
  },
  bgBubbleC: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: "#EDF2FF",
    top: "35%",
    right: -160
  },
  hero: {
    marginBottom: 14
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: theme.colors.text,
    letterSpacing: 0.25
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 21
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#112A46",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4
  },
  formTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4
  },
  formSubtitle: {
    color: theme.colors.muted,
    marginBottom: 14,
    lineHeight: 20
  },
  label: {
    color: theme.colors.text,
    marginBottom: 6,
    fontWeight: "700",
    fontSize: 13
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#FAFCFF"
  },
  inputIcon: {
    marginRight: 8
  },
  eyeBtn: {
    paddingVertical: 6,
    paddingLeft: 8
  },
  action: {
    backgroundColor: "#0F6E8C",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 2
  },
  actionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  },
  switchHint: {
    marginTop: 14,
    alignItems: "center"
  },
  hintText: {
    color: "#3D5775",
    fontWeight: "600"
  },
  hintAction: {
    color: "#0F6E8C",
    fontWeight: "800"
  }
});
