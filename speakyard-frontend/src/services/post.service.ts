import api from "../api/axios";

export const likeUnlikePost = async (postId: string) => {
  const response = await api.put(`/post/${postId}/like`);
  return response.data;
};

export const createPost = async (formData: FormData) => {
  const response = await api.post("/post/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyPosts = async () => {
  const response = await api.get("/post/my-posts");
  return response.data;
};

export const getPostById = async (postId: string) => {
  const response = await api.get(`/post/${postId}`);
  return response.data;
};

export const getPostsByUserId = async (userId: string) => {
  const response = await api.get(`/post/user/${userId}`);
  return response.data;
};

export const updatePost = async ({
  postId,
  formData,
}: {
  postId: string;
  formData: FormData;
}) => {
  const response = await api.put(`/post/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/post/${postId}`);
  return response.data;
};

export const archivePost = async (postId: string) => {
  const response = await api.put(`/post/${postId}/archive`);
  return response.data;
};

export const unarchivePost = async (postId: string) => {
  const response = await api.put(`/post/${postId}/unarchive`);
  return response.data;
};
export const getArchivedPosts = async () => {
  const response = await api.get("/post/archived");
  return response.data;
};