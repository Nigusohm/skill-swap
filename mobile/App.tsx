import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { AuthScreen } from "./src/screens/AuthScreen";
import { LandingScreen } from "./src/screens/LandingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { MatchesScreen } from "./src/screens/MatchesScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { ScheduleScreen } from "./src/screens/ScheduleScreen";
import { api, withAuth } from "./src/api/client";
import { UserProfile } from "./src/types/models";
import { theme } from "./src/theme";

type Tab = "home" | "profile" | "matches" | "chat" | "sessions";

const AppShell: React.FC = () => {
  const { token, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [chatTargetPeerId, setChatTargetPeerId] = useState<string | null>(null);
  const [sessionTargetPeerId, setSessionTargetPeerId] = useState<string | null>(null);

  const fetchMe = async () => {
    if (!token) {
      return;
    }

    setBusy(true);
    try {
      const res = await api.get("/api/users/me", withAuth(token));
      setProfile(res.data);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe().catch(() => undefined);
    }
  }, [token]);

  const tabs = useMemo(
    () => [
      { key: "home" as const, label: "Home" },
      { key: "matches" as const, label: "Matches" },
      { key: "chat" as const, label: "Chat" },
      { key: "sessions" as const, label: "Sessions" },
      { key: "profile" as const, label: "Profile" }
    ],
    []
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!token) {
    if (!authMode) {
      return <LandingScreen onOpenAuth={setAuthMode} />;
    }

    return <AuthScreen initialMode={authMode} onBack={() => setAuthMode(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>SkillSwap</Text>
          <Text style={styles.sub}>{profile?.school || "Student Exchange Network"}</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutTxt}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {busy ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            {tab === "home" && <HomeScreen token={token} profile={profile} />}
            {tab === "profile" && <ProfileScreen token={token} profile={profile} onSaved={fetchMe} />}
            {tab === "matches" && (
              <MatchesScreen
                token={token}
                onChat={(peerId) => {
                  setChatTargetPeerId(peerId);
                  setTab("chat");
                }}
                onSchedule={(peerId) => {
                  setSessionTargetPeerId(peerId);
                  setTab("sessions");
                }}
              />
            )}
            {tab === "chat" && (
              <ChatScreen
                token={token}
                userId={profile?.id}
                targetPeerId={chatTargetPeerId}
                onHandledTarget={() => setChatTargetPeerId(null)}
              />
            )}
            {tab === "sessions" && (
              <ScheduleScreen
                token={token}
                prefillPartnerId={sessionTargetPeerId}
                onHandledPrefill={() => setSessionTargetPeerId(null)}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.tabBar}>
        {tabs.map((item) => (
          <Pressable key={item.key} style={[styles.tabBtn, tab === item.key && styles.tabBtnActive]} onPress={() => setTab(item.key)}>
            <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  body: {
    flex: 1
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: "#fff"
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text
  },
  sub: {
    marginTop: 3,
    color: theme.colors.muted,
    fontWeight: "600"
  },
  logoutBtn: {
    backgroundColor: "#FFE8E8",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  logoutTxt: {
    color: theme.colors.danger,
    fontWeight: "800"
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: "#0B4E68",
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  tabText: {
    color: theme.colors.muted,
    fontWeight: "700",
    fontSize: 12
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "800"
  }
});
