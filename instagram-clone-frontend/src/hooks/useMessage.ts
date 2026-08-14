import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  sendVoiceMessage,
} from "../services/message.service";

// ─── Polling intervals ────────────────────────────────────────────────────────
// Messages poll every 1 s while the tab is active; pauses automatically when
// the user switches away (refetchIntervalInBackground: false is the default).
const MESSAGES_POLL_MS = 1000;
// Conversation list (sidebar) only needs to update every 3 s.
const CONVERSATIONS_POLL_MS = 3000;

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useConversations = () =>
  useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    staleTime: 0,
    refetchInterval: CONVERSATIONS_POLL_MS,
    refetchIntervalInBackground: false, // pause polling when tab is hidden
  });

export const useMessages = (conversationId: string) =>
  useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 0,
    refetchInterval: MESSAGES_POLL_MS,
    refetchIntervalInBackground: false, // pause when user switches tab
  });

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,

    // ── Optimistic update ─────────────────────────────────────────────────────
    // Add the message to the cache instantly so the sender sees it immediately
    // without waiting for the server round-trip or the next poll cycle.
    onMutate: async (variables) => {
      const queryKey = ["messages", variables.conversationId];

      // Stop any in-flight refetch so it doesn't stomp our optimistic entry
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        const optimistic = {
          _id: `optimistic-${Date.now()}`,
          content: variables.content,
          // Use a sentinel so ChatWindow knows to render it as "mine"
          sender: { _id: "__optimistic__" },
          createdAt: new Date().toISOString(),
          _optimistic: true,
        };
        return {
          ...(old ?? {}),
          messages: [...(old?.messages ?? []), optimistic],
        };
      });

      return { previous, queryKey };
    },

    onError: (_err, _vars, context: any) => {
      // Roll back on network failure
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },

    onSuccess: (_data, variables) => {
      // Swap the optimistic entry for real server data immediately
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

export const useSendVoiceMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendVoiceMessage,

    // Optimistic placeholder so the sender sees a "Sending…" bubble immediately
    onMutate: async (variables) => {
      const queryKey = ["messages", variables.conversationId];
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
        const optimistic = {
          _id: `optimistic-voice-${Date.now()}`,
          type: "voice",
          content: "",
          sender: { _id: "__optimistic__" },
          createdAt: new Date().toISOString(),
          _optimistic: true,
        };
        return {
          ...(old ?? {}),
          messages: [...(old?.messages ?? []), optimistic],
        };
      });

      return { previous, queryKey };
    },

    onError: (_err, _vars, context: any) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
