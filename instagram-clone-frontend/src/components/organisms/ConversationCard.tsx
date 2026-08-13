import { Link } from "react-router-dom";
import { Users } from "lucide-react";

type User = {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
};

type LastMessage = {
  _id: string;
  content: string;
  createdAt: string;
};

type Conversation = {
  _id: string;
  participants: User[];
  lastMessage?: LastMessage;
  isGroup?: boolean;
  groupName?: string;
};

type Props = {
  conversation: Conversation;
  currentUserId: string;
  selectedConversationId?: string;
};

/** Compact relative time: "2m", "3h", "Mon", "Mar 5" */
function shortTime(dateStr: string): string {
  const d    = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "now";
  if (mins  < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days  < 7)  return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const ConversationCard = ({
  conversation,
  currentUserId,
  selectedConversationId,
}: Props) => {
  const isGroup = conversation.isGroup === true;

  const otherUser = !isGroup
    ? conversation.participants.find((u) => u._id !== currentUserId)
    : null;

  if (!isGroup && !otherUser) return null;

  const displayName = isGroup
    ? (conversation.groupName ?? "Group")
    : otherUser!.name;

  const displayUsername = !isGroup ? otherUser!.username : null;

  const lastMsgTime = conversation.lastMessage?.createdAt
    ? shortTime(conversation.lastMessage.createdAt)
    : null;

  const isSelected = selectedConversationId === conversation._id;

  return (
    <Link
      to={`/messages/${conversation._id}`}
      className={`
        flex items-center gap-3 px-4 py-3 transition
        active:bg-gray-100
        ${isSelected ? "bg-gray-50" : "hover:bg-gray-50"}
      `}
    >
      {/* ── Avatar ─────────────────────────────── */}
      <div className="shrink-0">
        {isGroup ? (
          <div className="relative w-12 h-12">
            {conversation.participants.slice(0, 2).map((p, i) => (
              <div
                key={p._id}
                className={`absolute w-8 h-8 rounded-full border-2 border-white overflow-hidden ${
                  i === 0 ? "top-0 left-0" : "bottom-0 right-0"
                }`}
              >
                {p.profilePicture ? (
                  <img src={p.profilePicture} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[11px] font-semibold text-gray-600">
                    {p.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
            ))}
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#0095f6] rounded-full p-0.5">
              <Users size={9} className="text-white" />
            </div>
          </div>
        ) : otherUser!.profilePicture ? (
          <img
            src={otherUser!.profilePicture}
            alt={otherUser!.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-500">
            {otherUser!.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      {/* ── Text ───────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 truncate leading-tight">
            {displayName}
          </p>
          {lastMsgTime && (
            <span className="text-[11px] text-gray-400 shrink-0">{lastMsgTime}</span>
          )}
        </div>

        <p className="text-sm text-gray-500 truncate leading-tight mt-0.5">
          {conversation.lastMessage?.content
            ? conversation.lastMessage.content
            : displayUsername
            ? `@${displayUsername}`
            : isGroup
            ? `${conversation.participants.length} members`
            : ""}
        </p>
      </div>
    </Link>
  );
};

export default ConversationCard;
