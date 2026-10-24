import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";

type NewMessageEvent = { conversationId: string; message: any };
type UpdateMessageEvent = { conversationId: string; message: any };
type DeleteMessageEvent = { conversationId: string; messageId: string };
type ReadEvent = { conversationId: string; readBy: string };
type TypingEvent = { conversationId: string; userId: string; isTyping: boolean };
type PresenceEvent = { userId: string; online: boolean };

// Connects the socket while the user is authenticated and keeps the React
// Query caches for messages/conversations in sync with real-time events.
// Polling (see useMessage.ts) stays on as a slower fallback in case an
// event is missed (e.g. the socket briefly disconnects).
export const useChatSocket = (currentUserId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const handleNewMessage = ({ conversationId, message }: NewMessageEvent) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;
        if (old.messages?.some((m: any) => m._id === message._id)) return old;

        return {
          ...old,
          messages: [...(old.messages ?? []), message],
          totalMessages: (old.totalMessages ?? old.messages?.length ?? 0) + 1,
        };
      });

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleMessageUpdate = ({ conversationId, message }: UpdateMessageEvent) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: (old.messages ?? []).map((m: any) =>
            m._id === message._id ? { ...m, ...message } : m
          ),
        };
      });
    };

    const handleMessageDelete = ({ conversationId, messageId }: DeleteMessageEvent) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: (old.messages ?? []).filter((m: any) => m._id !== messageId),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleMessageRead = ({ conversationId }: ReadEvent) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          messages: (old.messages ?? []).map((m: any) =>
            (m.sender?._id ?? m.sender) === currentUserId ? { ...m, isRead: true } : m
          ),
        };
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:update", handleMessageUpdate);
    socket.on("message:delete", handleMessageDelete);
    socket.on("message:read", handleMessageRead);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:update", handleMessageUpdate);
      socket.off("message:delete", handleMessageDelete);
      socket.off("message:read", handleMessageRead);
    };
  }, [currentUserId, queryClient]);
};

// Refreshes the "People to practice with" list whenever someone comes
// online or goes offline.
export const useOnlinePartnersSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handlePresenceUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["online-partners"] });
    };

    socket.on("presence:update", handlePresenceUpdate);
    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [queryClient]);
};

// Per-conversation typing indicator, scoped to the open ChatWindow.
export const useTypingIndicator = (conversationId: string) => {
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingSentRef = useRef(false);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setTypingUserId(null);
    typingSentRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    const socket = getSocket();

    const handleTypingUpdate = (payload: TypingEvent) => {
      if (payload.conversationId !== conversationId) return;
      setTypingUserId(payload.isTyping ? payload.userId : null);
    };

    socket.on("typing:update", handleTypingUpdate);
    return () => {
      socket.off("typing:update", handleTypingUpdate);
    };
  }, [conversationId]);

  // Stop notifying (and tell the server) if the chat is closed mid-typing.
  useEffect(() => {
    return () => {
      clearTimeout(stopTimeoutRef.current);
      if (typingSentRef.current) {
        getSocket().emit("typing:stop", { conversationId });
      }
    };
  }, [conversationId]);

  const notifyTyping = () => {
    const socket = getSocket();

    if (!typingSentRef.current) {
      typingSentRef.current = true;
      socket.emit("typing:start", { conversationId });
    }

    clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      typingSentRef.current = false;
      socket.emit("typing:stop", { conversationId });
    }, 2000);
  };

  return { typingUserId, notifyTyping };
};

// Online/offline presence for a single other user (e.g. the chat partner
// shown in a ChatWindow header).
export const usePresence = (userId?: string) => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setOnline(false);
    if (!userId) return;

    const socket = getSocket();

    const handlePresenceUpdate = (payload: PresenceEvent) => {
      if (payload.userId !== userId) return;
      setOnline(payload.online);
    };

    socket.on("presence:update", handlePresenceUpdate);
    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [userId]);

  return online;
};

// Marks the conversation as read on the server (and for the other
// participants) whenever new messages arrive while it's open.
export const useMarkConversationRead = (conversationId: string, messageCount: number) => {
  useEffect(() => {
    if (!conversationId) return;
    getSocket().emit("message:read", { conversationId });
  }, [conversationId, messageCount]);
};
