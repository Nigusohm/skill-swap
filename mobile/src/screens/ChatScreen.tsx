import React, { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api, apiBaseUrl, withAuth } from "../api/client";
import { ChatListItem, Message } from "../types/models";
import { theme } from "../theme";

type ChatScreenProps = {
  token: string;
  userId: string | undefined;
  targetPeerId?: string | null;
  onHandledTarget: () => void;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ token, userId, targetPeerId, onHandledTarget }) => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const selectedChat = useMemo(() => chats.find((c) => c.id === selectedChatId) || null, [chats, selectedChatId]);

  const loadChats = async () => {
    const res = await api.get("/api/chats", withAuth(token));
    setChats(res.data);
    if (!selectedChatId && res.data[0]?.id) {
      setSelectedChatId(res.data[0].id);
    }
  };

  const loadMessages = async (chatId: string) => {
    const res = await api.get(`/api/chats/${chatId}/messages`, withAuth(token));
    setMessages(res.data);
  };

  useEffect(() => {
    loadChats().catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!selectedChatId) {
      return;
    }
    loadMessages(selectedChatId).catch(() => undefined);
  }, [selectedChatId, token]);

  useEffect(() => {
    const s = io(apiBaseUrl, {
      auth: { token }
    });

    s.on("new_message", (message: Message) => {
      if (message.chatId === selectedChatId) {
        setMessages((prev) => [...prev, message]);
      }
      loadChats().catch(() => undefined);
    });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [token, selectedChatId]);

  useEffect(() => {
    if (!selectedChatId || !socket) {
      return;
    }

    socket.emit("join_chat", selectedChatId);
  }, [selectedChatId, socket]);

  useEffect(() => {
    if (!targetPeerId) {
      return;
    }

    (async () => {
      const start = await api.post("/api/chats/start", { peerId: targetPeerId }, withAuth(token));
      const chat = start.data as { id: string };
      await loadChats();
      setSelectedChatId(chat.id);
      onHandledTarget();
    })().catch(() => onHandledTarget());
  }, [targetPeerId, token, onHandledTarget]);

  const send = () => {
    if (!draft.trim() || !selectedChatId || !socket) {
      return;
    }

    socket.emit("send_message", {
      chatId: selectedChatId,
      content: draft.trim()
    });
    setDraft("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatList}>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.chatPill, selectedChatId === item.id && styles.chatPillActive]}
              onPress={() => setSelectedChatId(item.id)}
            >
              <Text style={[styles.chatPillText, selectedChatId === item.id && styles.chatPillTextActive]}>{item.peer.name}</Text>
            </Pressable>
          )}
        />
      </View>

      <View style={styles.messageBox}>
        <Text style={styles.chatTitle}>{selectedChat ? `Chat with ${selectedChat.peer.name}` : "No chat selected"}</Text>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.msgList}
          renderItem={({ item }) => {
            const mine = userId && item.senderId === userId;
            return (
              <View style={[styles.msg, mine ? styles.mine : styles.theirs]}>
                <Text style={styles.msgText}>{item.content}</Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Type a message" value={draft} onChangeText={setDraft} />
          <Pressable style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    gap: 10
  },
  chatList: {
    minHeight: 50
  },
  chatPill: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#fff"
  },
  chatPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  chatPillText: {
    color: theme.colors.text,
    fontWeight: "600"
  },
  chatPillTextActive: {
    color: "#fff"
  },
  messageBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 10
  },
  chatTitle: {
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 6
  },
  msgList: {
    gap: 8,
    paddingBottom: 12
  },
  msg: {
    maxWidth: "78%",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  mine: {
    backgroundColor: "#D6EEF6",
    alignSelf: "flex-end"
  },
  theirs: {
    backgroundColor: "#EEF3F8",
    alignSelf: "flex-start"
  },
  msgText: {
    color: theme.colors.text
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff"
  },
  sendBtn: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  sendText: {
    color: "#fff",
    fontWeight: "700"
  }
});
