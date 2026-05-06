import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api, withAuth } from "../api/client";
import { Session } from "../types/models";
import { theme } from "../theme";

type ScheduleScreenProps = {
  token: string;
  prefillPartnerId?: string | null;
  onHandledPrefill: () => void;
};

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ token, prefillPartnerId, onHandledPrefill }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillRequested, setSkillRequested] = useState("");
  const [startAt, setStartAt] = useState("2026-05-10T15:00:00.000Z");
  const [endAt, setEndAt] = useState("2026-05-10T16:00:00.000Z");

  const load = async () => {
    const res = await api.get("/api/sessions", withAuth(token));
    setSessions(res.data);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!prefillPartnerId) {
      return;
    }

    setPartnerId(prefillPartnerId);
    onHandledPrefill();
  }, [prefillPartnerId, onHandledPrefill]);

  const createSession = async () => {
    try {
      await api.post(
        "/api/sessions",
        {
          partnerId,
          skillOffered,
          skillRequested,
          startAt,
          endAt
        },
        withAuth(token)
      );

      setSkillOffered("");
      setSkillRequested("");
      await load();
      Alert.alert("Scheduled", "Session request sent.");
    } catch {
      Alert.alert("Failed", "Could not create session.");
    }
  };

  const updateStatus = async (id: string, status: Session["status"]) => {
    await api.patch(`/api/sessions/${id}`, { status }, withAuth(token));
    await load();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Create Exchange Session</Text>
        <TextInput style={styles.input} placeholder="Partner User ID" value={partnerId} onChangeText={setPartnerId} />
        <TextInput style={styles.input} placeholder="Skill you offer" value={skillOffered} onChangeText={setSkillOffered} />
        <TextInput style={styles.input} placeholder="Skill you request" value={skillRequested} onChangeText={setSkillRequested} />
        <TextInput style={styles.input} placeholder="Start ISO Date" value={startAt} onChangeText={setStartAt} />
        <TextInput style={styles.input} placeholder="End ISO Date" value={endAt} onChangeText={setEndAt} />

        <Pressable style={styles.cta} onPress={createSession}>
          <Text style={styles.ctaText}>Create Session</Text>
        </Pressable>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>
              {item.skillOffered} ↔ {item.skillRequested}
            </Text>
            <Text style={styles.meta}>
              {item.userA.name} & {item.userB.name}
            </Text>
            <Text style={styles.meta}>Status: {item.status}</Text>

            <View style={styles.row}>
              <Pressable style={styles.smallBtn} onPress={() => updateStatus(item.id, "CONFIRMED")}>
                <Text style={styles.smallTxt}>Confirm</Text>
              </Pressable>
              <Pressable style={styles.smallBtn} onPress={() => updateStatus(item.id, "COMPLETED")}>
                <Text style={styles.smallTxt}>Complete</Text>
              </Pressable>
              <Pressable style={[styles.smallBtn, styles.cancel]} onPress={() => updateStatus(item.id, "CANCELED")}>
                <Text style={styles.smallTxt}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md
  },
  formCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    backgroundColor: "#fff"
  },
  cta: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center"
  },
  ctaText: {
    color: "#fff",
    fontWeight: "700"
  },
  list: {
    gap: 10,
    marginTop: 10,
    paddingBottom: 160
  },
  sessionCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 12
  },
  sessionTitle: {
    fontWeight: "800",
    color: theme.colors.text
  },
  meta: {
    marginTop: 4,
    color: theme.colors.muted
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  },
  smallBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  cancel: {
    backgroundColor: theme.colors.danger
  },
  smallTxt: {
    color: "#fff",
    fontWeight: "700"
  }
});
