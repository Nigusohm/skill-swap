import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, withAuth } from "../api/client";
import { Match } from "../types/models";
import { theme } from "../theme";

type MatchesScreenProps = {
  token: string;
  onChat: (peerId: string) => void;
  onSchedule: (peerId: string) => void;
};

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ token, onChat, onSchedule }) => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/api/matches", withAuth(token));
      setMatches(res.data);
    })().catch(() => setMatches([]));
  }, [token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {matches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyText}>Add more skills in your profile to improve your match results.</Text>
        </View>
      ) : (
        matches.map((match) => (
          <View key={match.userId} style={styles.card}>
            <Text style={styles.name}>{match.name}</Text>
            <Text style={styles.meta}>{match.school || "Student"}</Text>
            <Text style={styles.score}>Match Score: {match.score}</Text>

            <Text style={styles.label}>They can teach you:</Text>
            <Text style={styles.value}>{match.teachToLearnOverlap.join(", ") || "-"}</Text>

            <Text style={styles.label}>You can teach them:</Text>
            <Text style={styles.value}>{match.learnToTeachOverlap.join(", ") || "-"}</Text>

            <View style={styles.actions}>
              <Pressable style={styles.chatBtn} onPress={() => onChat(match.userId)}>
                <Text style={styles.actionText}>Open Chat</Text>
              </Pressable>
              <Pressable style={styles.scheduleBtn} onPress={() => onSchedule(match.userId)}>
                <Text style={styles.actionText}>Schedule</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: 12
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text
  },
  emptyText: {
    marginTop: 6,
    color: theme.colors.muted
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text
  },
  meta: {
    color: theme.colors.muted,
    marginTop: 2
  },
  score: {
    marginTop: 8,
    color: theme.colors.secondary,
    fontWeight: "700"
  },
  label: {
    marginTop: 8,
    fontWeight: "700",
    color: theme.colors.text
  },
  value: {
    color: theme.colors.muted,
    marginTop: 2
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  chatBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  scheduleBtn: {
    flex: 1,
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  actionText: {
    color: "#fff",
    fontWeight: "700"
  }
});
