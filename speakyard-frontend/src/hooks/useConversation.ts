import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  createGroupConversation,
} from "../services/conversation.service";

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroupConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
