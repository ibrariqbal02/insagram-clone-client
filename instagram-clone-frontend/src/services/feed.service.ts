import api from "../api/axios";

export const getFeed = async () => {
  const response = await api.get("/feed");

  return response.data;
};

export const getReels = async () => {
  const response = await api.get("/feed/reels");
  return response.data;
};
