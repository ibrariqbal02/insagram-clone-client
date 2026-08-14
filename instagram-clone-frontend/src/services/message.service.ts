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

export const sendVoiceMessage = async ({
  conversationId,
  audioBlob,
}: {
  conversationId: string;
  audioBlob: Blob;
}) => {
  const formData = new FormData();
  // Determine extension from MIME type (e.g. audio/webm → .webm)
  const ext = audioBlob.type.split("/")[1]?.split(";")[0] ?? "webm";
  formData.append("audio", audioBlob, `voice_message.${ext}`);

  const { data } = await api.post(
    `/message/${conversationId}/voice`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
};