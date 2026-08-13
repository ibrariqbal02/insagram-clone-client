import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import Avatar from "../atoms/Avatar";

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

const ConversationCard = ({
  conversation,
  currentUserId,
  selectedConversationId,
}: Props) => {
  const isGroup = conversation.isGroup === true;

  // ── 1-on-1 ──────────────────────────────────────────────
  const otherUser = !isGroup
    ? conversation.participants.find((u) => u._id !== currentUserId)
    : null;

  // For 1-on-1, hide the card entirely if we can't find the other user
  if (!isGroup && !otherUser) return null;

  // ── Shared ────────────────────────────────────────────────
  const displayName = isGroup
    ? (conversation.groupName ?? "Group")
    : otherUser!.name;

  const rawDate = conversation.lastMessage?.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const lastMessageDate =
    parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : null;

  return (
    <Link
      to={`/messages/${conversation._id}`}
      className={`flex items-center gap-3 p-4 transition border-b hover:bg-gray-50 ${
        selectedConversationId === conversation._id ? "bg-blue-50" : ""
      }`}
    >
      {/* Avatar */}
      {isGroup ? (
        /* Stacked avatars for groups */
        <div className="relative w-12 h-12 shrink-0">
          {conversation.participants.slice(0, 2).map((p, i) => (
            <div
              key={p._id}
              className={`absolute w-8 h-8 rounded-full border-2 border-white overflow-hidden ${
                i === 0 ? "top-0 left-0" : "bottom-0 right-0"
              }`}
            >
              {p.profilePicture ? (
                <img
                  src={p.profilePicture}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {p.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
            </div>
          ))}
          {/* Group badge */}
          <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5">
            <Users size={9} className="text-white" />
          </div>
        </div>
      ) : (
        <Avatar
          src={otherUser!.profilePicture}
          name={otherUser!.name}
          size={12}
        />
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm truncate">{displayName}</h3>
          {lastMessageDate && (
            <span className="text-xs text-gray-400 shrink-0">
              {lastMessageDate.toLocaleDateString()}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 truncate mt-0.5">
          {conversation.lastMessage?.content || "No messages yet"}
        </p>

        {isGroup && (
          <p className="text-xs text-gray-400 truncate">
            {conversation.participants.length} members
          </p>
        )}
      </div>
    </Link>
  );
};

export default ConversationCard;
