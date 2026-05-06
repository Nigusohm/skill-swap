import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { api, withAuth } from "../api/client";
import { UserProfile } from "../types/models";
import { theme } from "../theme";

type ProfileScreenProps = {
  token: string;
  profile: UserProfile | null;
  onSaved: () => Promise<void>;
};

const fromCsv = (value: string): string[] =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ token, profile, onSaved }) => {
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [availability, setAvailability] = useState(profile?.availability ?? "");
  const [teach, setTeach] = useState((profile?.skillsToTeach ?? []).join(", "));
  const [learn, setLearn] = useState((profile?.skillsToLearn ?? []).join(", "));
  const [busy, setBusy] = useState(false);

  const averageRating = useMemo(() => profile?.rating ?? 0, [profile]);

  const save = async () => {
    try {
      setBusy(true);
      await api.patch(
        "/api/users/me",
        {
          bio,
          availability,
          skillsToTeach: fromCsv(teach),
          skillsToLearn: fromCsv(learn)
        },
        withAuth(token)
      );
      await onSaved();
      Alert.alert("Saved", "Profile updated successfully.");
    } catch {
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{profile?.name ?? "Student"}</Text>
        <Text style={styles.meta}>{profile?.school || "School not added"}</Text>
        <Text style={styles.rating}>Rating: {averageRating.toFixed(1)} / 5</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Bio</Text>
        <TextInput style={[styles.input, styles.multiline]} multiline value={bio} onChangeText={setBio} placeholder="Tell others what you enjoy teaching." />

        <Text style={styles.label}>Availability</Text>
        <TextInput style={styles.input} value={availability} onChangeText={setAvailability} placeholder="Weekdays after 5pm, weekends..." />

        <Text style={styles.label}>Skills You Can Teach (comma separated)</Text>
        <TextInput style={styles.input} value={teach} onChangeText={setTeach} placeholder="Graphic Design, Java, Public Speaking" />

        <Text style={styles.label}>Skills You Want to Learn (comma separated)</Text>
        <TextInput style={styles.input} value={learn} onChangeText={setLearn} placeholder="Math, React Native, French" />

        <Pressable style={styles.saveBtn} onPress={save} disabled={busy}>
          <Text style={styles.saveText}>{busy ? "Saving..." : "Save Profile"}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: 12
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text
  },
  meta: {
    color: theme.colors.muted,
    marginTop: 4
  },
  rating: {
    marginTop: 8,
    color: theme.colors.accent,
    fontWeight: "700"
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: theme.colors.text,
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff"
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  saveBtn: {
    marginTop: 14,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  saveText: {
    color: "#fff",
    fontWeight: "700"
  }
});
