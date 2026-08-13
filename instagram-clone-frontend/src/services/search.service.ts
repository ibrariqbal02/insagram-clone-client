import api from "../api/axios";

export const searchUsers = async (keyword: string) => {
  const { data } = await api.get(
    `/search/users?keyword=${keyword}`
  );

  return data;
};

export const searchPosts = async (keyword: string) => {
  const { data } = await api.get(
    `/search/posts?keyword=${keyword}`
  );

  return data;
};