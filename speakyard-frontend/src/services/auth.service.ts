import api from "../api/axios";

export const register = async (data: {
  name: string;
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const login = async (data: {
  login: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post("/auth/refresh-token");
  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (formData: FormData) => {
  const response = await api.put("/auth/update-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await api.patch("/auth/change-password", data);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post("/auth/forgot-password", {
    email,
  });

  return response.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const response = await api.patch("/auth/reset-password", data);

  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/auth/delete-account");
  return response.data;
};

export const updatePrivacy = async (isPrivate: boolean) => {
  const response = await api.patch("/auth/privacy", { isPrivate });
  return response.data;
};

