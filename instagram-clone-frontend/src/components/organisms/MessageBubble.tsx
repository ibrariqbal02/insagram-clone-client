import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
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

  // Focus the edit input as soon as it mounts
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

  const handleDelete = () => {
    if (message._optimistic) return;
    if (!window.confirm("Delete this message?")) return;
    deleteMessage.mutate(message._id, {
      // Optimistically remove from the list immediately
      onSuccess: () => {},
    });
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
          <button
            onClick={handleEditStart}
            title="Edit message"
            className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
          >
            <Pencil size={14} />
          </button>
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
        className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
          isMine
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white border rounded-bl-sm"
        } ${message._optimistic ? "opacity-70" : ""}`}
      >
        {isEditing ? (
          /* Inline edit mode */
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
          <p className="break-words text-sm leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Timestamp + edited label */}
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
      </div>
    </div>
  );
};

export default MessageBubble;
