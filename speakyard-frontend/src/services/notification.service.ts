import api from "../api/axios";

export const getNotifications = async () => {
  const { data } = await api.get("/notification");
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data } = await api.put(`/notification/${notificationId}/read`);
  return data;
};

export const deleteNotification = async (notificationId: string) => {
  const { data } = await api.delete(`/notification/${notificationId}`);
  return data;
};
