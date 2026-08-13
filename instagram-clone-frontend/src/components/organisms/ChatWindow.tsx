import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";

import {
  useConversations,
  useMessages,
  useSendMessage,
} from "../../hooks/useMessage";
import { useMyProfile } from "../../hooks/useProfile";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

type Props = {
  conversationId: string;
};

const ChatWindow = ({ conversationId }: Props) => {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: profileData } = useMyProfile();
  const currentUserId = profileData?.user?._id;

  const { data: messagesData, isLoading: messagesLoading } =
    useMessages(conversationId);

  const { data: conversationsData } = useConversations();

  const conversation = conversationsData?.conversations?.find(
    (c: any) => c._id === conversationId
  );

  const isGroup = conversation?.isGroup === true;

  // 1-on-1: the other participant
  const otherUser = !isGroup
    ? conversation?.participants?.find((p: any) => p._id !== currentUserId)
    : null;

  // Group: everyone except the current user (for the member avatars)
  const otherMembers: any[] = isGroup
    ? (conversation?.participants ?? []).filter(
        (p: any) => p._id !== currentUserId
      )
    : [];

  const sendMessage = useSendMessage();

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage.mutate({ conversationId, content: text });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  return (
    <div className="flex h-full flex-col bg-white">

      {/* ── Header ── */}
      <div className="border-b border-gray-200 bg-white px-3 md:px-4 flex items-center gap-3 shrink-0" style={{ height: 56 }}>

        {/* Back (mobile) */}
        <button
          className="md:hidden mr-1 text-gray-600"
          onClick={() => navigate("/messages")}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Avatar(s) */}
        {!conversation ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
        ) : isGroup ? (
          /* Stacked mini-avatars for group */
          <div className="relative w-10 h-10 shrink-0">
            {otherMembers.slice(0, 2).map((p, i) => (
              <div
                key={p._id}
                className={`absolute w-7 h-7 rounded-full border-2 border-white overflow-hidden ${
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
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                    {p.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : otherUser?.profilePicture ? (
          <img
            src={otherUser.profilePicture}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold shrink-0">
            {otherUser?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        {/* Name / group info */}
        <div className="min-w-0">
          {isGroup ? (
            <>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold leading-tight truncate">
                  {conversation?.groupName ?? "Group"}
                </p>
                <Users size={14} className="text-gray-400 shrink-0" />
              </div>
              <p className="text-xs text-gray-500 truncate">
                {(conversation?.participants?.length ?? 0)} members ·{" "}
                {otherMembers
                  .slice(0, 3)
                  .map((p: any) => p.name?.split(" ")[0])
                  .join(", ")}
                {otherMembers.length > 3 ? "…" : ""}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold leading-tight truncate">
                {otherUser?.name ?? "Chat"}
              </p>
              {otherUser?.username && (
                <p className="text-xs text-gray-500">@{otherUser.username}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Message list ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5 bg-white">
        {messagesLoading ? (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Loading messages...
          </div>
        ) : (
          <>
            {(!messagesData?.messages ||
              messagesData.messages.length === 0) && (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                {isGroup
                  ? "Say hello to the group 👋"
                  : "Start your conversation 👋"}
              </div>
            )}

            {messagesData?.messages?.map((message: any) => (
              <MessageBubble
                key={message._id}
                message={message}
                conversationId={conversationId}
                isMine={
                  message._optimistic === true ||
                  message.sender?._id === currentUserId ||
                  message.sender === currentUserId
                }
                // In group chats show the sender's name above their bubble
                showSenderName={
                  isGroup &&
                  !(
                    message._optimistic === true ||
                    message.sender?._id === currentUserId ||
                    message.sender === currentUserId
                  )
                }
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <MessageInput onSend={handleSend} loading={sendMessage.isPending} />
    </div>
  );
};

export default ChatWindow;
