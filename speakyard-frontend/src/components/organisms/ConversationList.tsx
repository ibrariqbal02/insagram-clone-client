import ConversationCard from "./ConversationCard";
import { useConversations } from "../../hooks/useMessage";
import { useMyProfile } from "../../hooks/useProfile";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";

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
      <div className="p-4 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-12 h-12" circle />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const currentUserId = profile?.user?._id;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">

      {data?.conversations?.length === 0 && (
        <EmptyState
          emoji="💬"
          title="No conversations yet"
          description="Start a conversation with a practice partner — you'll find people to talk to on the Home screen."
        />
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