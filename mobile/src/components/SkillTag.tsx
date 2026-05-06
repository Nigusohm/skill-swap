import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

type SkillTagProps = {
  label: string;
  tone?: "primary" | "secondary";
};

export const SkillTag: React.FC<SkillTagProps> = ({ label, tone = "primary" }) => {
  return (
    <View style={[styles.tag, tone === "primary" ? styles.primary : styles.secondary]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1
  },
  primary: {
    backgroundColor: "#D6EEF6",
    borderColor: "#B7DEE9"
  },
  secondary: {
    backgroundColor: "#D7F3E8",
    borderColor: "#BDE7D6"
  },
  text: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 12
  }
});
