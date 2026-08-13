import api from "../api/axios";

export const getConversations = async () => {
  const { data } = await api.get("/conversation");

  return data;
};

export const getMessages = async (
  conversationId: string
) => {
  const { data } = await api.get(
    `/message/${conversationId}`
  );

  return data;
};

export const sendMessage = async ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) => {
  const { data } = await api.post(
    `/message/${conversationId}`,
    {
      content,
    }
  );

  return data;
};

export const deleteMessage = async (messageId: string) => {
  const { data } = await api.delete(`/message/${messageId}`);
  return data;
};

export const editMessage = async ({
  messageId,
  content,
}: {
  messageId: string;
  content: string;
}) => {
  const { data } = await api.patch(`/message/${messageId}`, { content });
  return data;
};