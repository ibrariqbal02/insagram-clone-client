import api from "../api/axios";

export const getMyProfile = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const getUserProfile = async (userId: string) => {
  const { data } = await api.get(`/auth/profile/${userId}`);
  return data;
};
export const updateProfile = async (data: FormData) => {
  const response = await api.put("/auth/update-profile", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
export const updatePrivacy = async (isPrivate: boolean) => {
  const response = await api.patch("/auth/privacy", {


    isPrivate,
  });

  return response.data;
};
export const getUserPosts = async (userId: string) => {
  const response = await api.get(`/post/user/${userId}`);

  return response.data;
};

export const followUnfollowUser = async (userId: string) => {
  const response = await api.put(`/follow/${userId}`);

  return response.data;
};

export const getFollowers = async (userId: string) => {
  const response = await api.get(`/follow/followers/${userId}`);
  return response.data;
};

export const getFollowing = async (userId: string) => {
  const response = await api.get(`/follow/following/${userId}`);
  return response.data;
};

export const removeFollower = async (userId: string) => {
  const response = await api.delete(`/follow/remove/${userId}`);
  return response.data;
};

