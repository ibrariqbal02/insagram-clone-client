import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  archivePost,
  createPost,
  deletePost,
  getArchivedPosts,
  getPostById,
  likeUnlikePost,
  unarchivePost,
  updatePost,
} from "../services/post.service";

export const useLikeUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likeUnlikePost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};

export const usePostById = (postId: string) => {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

      queryClient.removeQueries({
        queryKey: ["post", postId],
      });
    },
  });
};

export const useArchivePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archivePost,

    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts"],
      });

      queryClient.removeQueries({
        queryKey: ["post", postId],
      });
    },
  });
};

export const useUnarchivePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchivePost,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feed"],
      });

      queryClient.invalidateQueries({
        queryKey: ["user-posts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-posts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["archived-posts"],
      });
    },
  });
};

export const useArchivedPosts = () => {
  return useQuery({
    queryKey: ["archived-posts"],
    queryFn: getArchivedPosts,
  });
};