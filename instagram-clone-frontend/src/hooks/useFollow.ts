import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.put(`/follow/${userId}`);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      queryClient.invalidateQueries({
        queryKey: ["me"],
      });
    },
  });
};