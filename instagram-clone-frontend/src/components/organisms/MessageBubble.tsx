import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X, Mic } from "lucide-react";
import { useDeleteMessage, useEditMessage } from "../../hooks/useMessage";

type Props = {
  message: any;
  isMine: boolean;
  conversationId: string;
  showSenderName?: boolean;
};

const MessageBubble = ({ message, isMine, conversationId: _conversationId, showSenderName = false }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content ?? "");
  const editInputRef = useRef<HTMLInputElement>(null);

  const deleteMessage = useDeleteMessage();
  const editMessage = useEditMessage();

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const timestamp = message._optimistic
    ? "Sending…"
    : new Date(message.createdAt).toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

  const isVoice = message.type === "voice";
  // Voice messages can't be edited, so suppress the edit action
  const canEdit = isMine && !isVoice;

  const handleDelete = () => {
    if (message._optimistic) return;
    if (!window.confirm("Delete this message?")) return;
    deleteMessage.mutate(message._id);
  };

  const handleEditStart = () => {
    setEditText(message.content ?? "");
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(message.content ?? "");
  };

  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.content) {
      handleEditCancel();
      return;
    }
    editMessage.mutate(
      { messageId: message._id, content: trimmed },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleEditSave(); }
    if (e.key === "Escape") { e.preventDefault(); handleEditCancel(); }
  };

  return (
    <div
      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sender name in group chats */}
      {showSenderName && message.sender?.name && (
        <p className="text-xs text-gray-500 mb-0.5 px-1">
          {message.sender.name}
        </p>
      )}

      {/* ── Action bar (own messages only, shown on hover) ── */}
      {isMine && !message._optimistic && (
        <div
          className={`flex items-center gap-1 mb-1 transition-all duration-150 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          {canEdit && (
            <button
              onClick={handleEditStart}
              title="Edit message"
              className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteMessage.isPending}
            title="Delete message"
            className="p-1 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition disabled:opacity-40"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* ── Bubble ── */}
      <div
        className={`max-w-[75%] rounded-2xl shadow-sm ${
          isVoice
            ? // Voice bubbles: minimal padding, slightly wider
              `px-3 py-2 ${isMine ? "bg-blue-500 rounded-br-sm" : "bg-white border rounded-bl-sm"}`
            : `px-4 py-2 ${isMine ? "bg-blue-500 text-white rounded-br-sm" : "bg-white border rounded-bl-sm"}`
        } ${message._optimistic ? "opacity-70" : ""}`}
      >
        {/* ── Voice message ── */}
        {isVoice ? (
          <div className="flex flex-col gap-1">
            {message._optimistic || !message.content ? (
              // Optimistic placeholder while uploading
              <div className="flex items-center gap-2 text-sm text-white/80 py-1">
                <Mic size={15} className="shrink-0" />
                <span>Sending voice message…</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Mic
                  size={15}
                  className={`shrink-0 ${isMine ? "text-white/70" : "text-gray-400"}`}
                />
                <audio
                  src={message.content}
                  controls
                  preload="metadata"
                  className="h-8"
                  style={{
                    // Tighten up the native player so it fits the bubble
                    minWidth: 180,
                    maxWidth: 260,
                    colorScheme: "light",
                  }}
                />
              </div>
            )}
            {/* Timestamp */}
            <p
              className={`text-[11px] mt-0.5 ${
                isMine ? "text-blue-100" : "text-gray-400"
              }`}
            >
              {timestamp}
            </p>
          </div>
        ) : isEditing ? (
          /* ── Inline edit mode ── */
          <div className="flex items-center gap-2 min-w-[160px]">
            <input
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleEditKeyDown}
              className="flex-1 bg-transparent border-b border-white/60 outline-none text-sm py-0.5"
            />
            <button
              onClick={handleEditSave}
              disabled={editMessage.isPending}
              title="Save"
              className="shrink-0 hover:opacity-80 transition disabled:opacity-40"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleEditCancel}
              title="Cancel"
              className="shrink-0 hover:opacity-80 transition"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* ── Text message ── */
          <>
            <p className="break-words text-sm leading-relaxed">
              {message.content}
            </p>
            <p
              className={`mt-0.5 text-[11px] ${
                isMine ? "text-blue-100" : "text-gray-400"
              }`}
            >
              {timestamp}
              {message.isEdited && !message._optimistic && (
                <span className="ml-1 italic">· edited</span>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
