import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../api/client";
import { withAuth } from "../api/client";
import { SkillTag } from "../components/SkillTag";
import { UserProfile } from "../types/models";
import { theme } from "../theme";

type HomeScreenProps = {
  token: string;
  profile: UserProfile | null;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ token, profile }) => {
  const [popularTeach, setPopularTeach] = useState<string[]>([]);
  const [popularLearn, setPopularLearn] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/api/skills", withAuth(token));
      const topTeach = (res.data.topTeachSkills as Array<{ skill: string; count: number }>).slice(0, 6);
      const topLearn = (res.data.topLearnSkills as Array<{ skill: string; count: number }>).slice(0, 6);
      setPopularTeach(topTeach.map((s) => s.skill));
      setPopularLearn(topLearn.map((s) => s.skill));
    })().catch(() => undefined);
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.banner}>
        <View style={styles.bannerGlowA} />
        <View style={styles.bannerGlowB} />
        <Text style={styles.greeting}>Welcome{profile ? `, ${profile.name}` : ""}</Text>
        <Text style={styles.bannerText}>Trade knowledge, not money. Build your skill network on campus.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.skillsToTeach?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Teach Skills</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.skillsToLearn?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Learn Goals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.rating ? profile.rating.toFixed(1) : "0.0"}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={({ hovered }: any) => [styles.actionCard, hovered && styles.actionCardHover]}>
          <LinearGradient colors={theme.colors.primaryGradient as [string, string]} style={styles.actionIconWrap}>
            <Ionicons name="search-outline" size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.actionTitle}>Find Matches</Text>
          <Text style={styles.actionSub}>Discover skill partners instantly.</Text>
        </Pressable>

        <Pressable style={({ hovered }: any) => [styles.actionCard, hovered && styles.actionCardHover]}>
          <View style={[styles.actionIconWrap, styles.actionIconAlt]}>
            <Ionicons name="notifications-outline" size={16} color={theme.colors.accent} />
          </View>
          <Text style={styles.actionTitle}>Notifications</Text>
          <Text style={styles.actionSub}>2 new messages and 1 upcoming session.</Text>
        </Pressable>
      </View>

      <View style={styles.quickRow}>
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Profile</Text>
          <Text style={styles.quickText}>Keep your skills updated for better matches.</Text>
        </View>
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Matches</Text>
          <Text style={styles.quickText}>Start chats with people matching your goals.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Teach Skills</Text>
        <View style={styles.rowWrap}>
          {profile?.skillsToTeach?.length ? profile.skillsToTeach.map((s) => <SkillTag key={s} label={s} />) : <Text style={styles.empty}>Add skills in Profile tab.</Text>}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Learning Goals</Text>
        <View style={styles.rowWrap}>
          {profile?.skillsToLearn?.length ? profile.skillsToLearn.map((s) => <SkillTag key={s} label={s} tone="secondary" />) : <Text style={styles.empty}>Add learning goals in Profile tab.</Text>}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Popular Skills Students Teach</Text>
        <View style={styles.rowWrap}>
          {popularTeach.length ? popularTeach.map((s) => <SkillTag key={s} label={s} tone="secondary" />) : <Text style={styles.empty}>No data yet.</Text>}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Popular Skills Students Want to Learn</Text>
        <View style={styles.rowWrap}>
          {popularLearn.length ? popularLearn.map((s) => <SkillTag key={s} label={s} />) : <Text style={styles.empty}>No data yet.</Text>}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: 12,
    paddingBottom: 28
  },
  banner: {
    backgroundColor: "#7C3AED",
    borderRadius: theme.radius.lg,
    padding: 16,
    overflow: "hidden"
  },
  bannerGlowA: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.16)",
    top: -42,
    right: -70
  },
  bannerGlowB: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.12)",
    bottom: -30,
    left: -16
  },
  greeting: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900"
  },
  bannerText: {
    color: "#EFE7FF",
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center"
  },
  statLabel: {
    color: "#ECE1FF",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    fontWeight: "700"
  },
  quickRow: {
    flexDirection: "row",
    gap: 10
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#1E1B4B",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12
  },
  quickTitle: {
    color: "#DFF3FF",
    fontWeight: "800",
    fontSize: 14
  },
  quickText: {
    color: "#C7D2FE",
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18
  },
  actionRow: {
    flexDirection: "row",
    gap: 10
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12
  },
  actionCardHover: {
    transform: [{ translateY: -2 }],
    shadowColor: "#7C3AED",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  actionIconAlt: {
    backgroundColor: "#ECFDF5"
  },
  actionTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  actionSub: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 14,
    borderColor: theme.colors.border,
    borderWidth: 1,
    shadowColor: "#0D273A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1
  },
  sectionTitle: {
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 10,
    fontSize: 15
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  empty: {
    color: theme.colors.muted,
    lineHeight: 20
  }
});
