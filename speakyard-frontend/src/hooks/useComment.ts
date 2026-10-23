import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as commentService from "../services/comment.service";

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentService.getComments(postId),
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.createComment,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.updateComment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.deleteComment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};

export const useLikeUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentService.likeUnlikeComment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};
