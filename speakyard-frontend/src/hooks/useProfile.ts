import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyProfile,
  updateProfile,
  getUserPosts,
  followUnfollowUser,
  getUserProfile,
  getFollowers,
  getFollowing,
  removeFollower,
  updatePrivacy,
} from "../services/profile.service";

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
};
export const useUpdatePrivacy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePrivacy,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
export const useFollowers = (userId: string) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });
};

export const useFollowing = (userId: string) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });
};

export const useRemoveFollower = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFollower,

    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: ["followers", userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["me"],
      });

      queryClient.invalidateQueries({
        queryKey: ["profile", userId],
      });
    },
  });
};

export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: ["user-posts", userId],

    queryFn: () => getUserPosts(userId),

    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["me"],
      });

      // Refresh the viewed profile if we know its id
      const userId = variables.get("userId") as string | null;

      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["profile", userId],
        });
      }
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUnfollowUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
};
