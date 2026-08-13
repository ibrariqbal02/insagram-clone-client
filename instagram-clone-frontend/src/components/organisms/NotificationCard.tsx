import { Trash2 } from "lucide-react";

type Props = {
  notification: any;
  onClick: () => void;
  onDelete: () => void;
};

const NotificationCard = ({ notification, onClick, onDelete }: Props) => {
  const sender = notification.sender;

  const text =
    notification.type === "follow"
      ? "started following you"
      : notification.type === "like"
      ? notification.comment
        ? "liked your comment"
        : "liked your post"
      : notification.type === "comment"
      ? "commented on your post"
      : notification.type === "reply"
      ? "replied to your comment"
      : notification.type === "message"
      ? "sent you a message"
      : "sent you a notification";

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-4 cursor-pointer ${
        notification.isRead ? "bg-white" : "bg-blue-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        {sender?.profilePicture ? (
          <img
            src={sender.profilePicture}
            alt={sender.name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg font-semibold shrink-0">
            {sender?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <div className="min-w-0">
          <div className="text-sm truncate">
            <span className="font-semibold mr-1">
              {sender?.username}
            </span>
            {text}
          </div>

          <div className="text-xs text-gray-500">
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : ""}
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default NotificationCard;
