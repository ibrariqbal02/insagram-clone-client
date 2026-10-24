import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authService from "../services/auth.service";

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["me"],
      });
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: authService.getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes — avoids refetch on every mount/route change
    retry: false,              // don't retry on 401; treat it as logged out immediately
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      const userId = variables.get("userId") as string | null;

      if (userId) {
        // Also refresh the specific user-profile and their posts
        queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        queryClient.invalidateQueries({ queryKey: ["user-posts", userId] });
      }
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.completeOnboarding,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const usePracticeStats = () => {
  return useQuery({
    queryKey: ["practice-stats"],
    queryFn: authService.getPracticeStats,
    staleTime: 60 * 1000,
  });
};

// Partners currently connected over Socket.IO. Presence events refresh this
// list (see useOnlinePartnersSync in useSocket.ts); the interval is a fallback.
export const useOnlinePartners = () => {
  return useQuery({
    queryKey: ["online-partners"],
    queryFn: authService.getOnlinePartners,
    staleTime: 15 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.deleteAccount,

    onSuccess: () => {
      queryClient.clear();
    },
  });
};
