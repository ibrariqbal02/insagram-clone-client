import api from "../api/axios";

export const createConversation = async (receiverId: string) => {
  const { data } = await api.post("/conversation", { receiverId });
  return data;
};

export const createGroupConversation = async ({
  participantIds,
  groupName,
}: {
  participantIds: string[];
  groupName: string;
}) => {
  const { data } = await api.post("/conversation/group", {
    participantIds,
    groupName,
  });
  return data;
};
