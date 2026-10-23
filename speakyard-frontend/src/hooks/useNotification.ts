import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as notificationService from "../services/notification.service";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getNotifications,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.markNotificationAsRead,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationService.deleteNotification,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};
