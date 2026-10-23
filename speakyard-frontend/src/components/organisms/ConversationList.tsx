import ConversationCard from "./ConversationCard";
import { useConversations } from "../../hooks/useMessage";
import { useMyProfile } from "../../hooks/useProfile";

type Props = {
  selectedConversationId?: string;
};

const ConversationList = ({
  selectedConversationId,
}: Props) => {
  const { data, isLoading } = useConversations();

  const { data: profile } = useMyProfile();

  if (isLoading) {
    return (
      <div className="p-4">
        Loading conversations...
      </div>
    );
  }

  const currentUserId = profile?.user?._id;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">

      {data?.conversations?.length === 0 && (
        <p className="text-center py-10 text-gray-500">
          No conversations yet
        </p>
      )}

      {data?.conversations?.map((conversation: any) => (
        <ConversationCard
          key={conversation._id}
          conversation={conversation}
          currentUserId={currentUserId}
          selectedConversationId={selectedConversationId}
        />
      ))}

    </div>
  );
};

export default ConversationList;