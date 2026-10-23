import api from "../api/axios";

export const getComments = async (postId: string) => {
  const response = await api.get(`/comment/${postId}`);
  return response.data;
};

export const createComment = async (data: {
  postId: string;
  text: string;
  parentComment?: string;
}) => {
  const response = await api.post(`/comment/${data.postId}`, {
    text: data.text,
    parentComment: data.parentComment,
  });

  return response.data;
};

export const updateComment = async (data: {
  commentId: string;
  text: string;
}) => {
  const response = await api.put(`/comment/${data.commentId}`, {
    text: data.text,
  });

  return response.data;
};

export const deleteComment = async (commentId: string) => {
  const response = await api.delete(`/comment/${commentId}`);

  return response.data;
};

export const likeUnlikeComment = async (commentId: string) => {
  const response = await api.put(`/comment/${commentId}/like`);

  return response.data;
};