import { Trash2 } from "lucide-react";

type Props = {
  notification: any;
  onClick: () => void;
  onDelete: () => void;
};

/** Map notification type → human-readable action text */
function actionText(n: any): string {
  switch (n.type) {
    case "follow":  return "started following you.";
    case "like":    return n.comment ? "liked your comment." : "liked your post.";
    case "comment": return "commented on your post.";
    case "reply":   return "replied to your comment.";
    case "message": return "sent you a message.";
    default:        return "sent you a notification.";
  }
}

/** Short relative time matching Instagram style */
function relativeTime(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(diff / 604_800_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days  < 7)  return `${days}d`;
  if (weeks < 52) return `${weeks}w`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const NotificationCard = ({ notification, onClick, onDelete }: Props) => {
  const sender = notification.sender;

  return (
    /*
     * Real Instagram notification row:
     *   - Full-width tap target, no border/card chrome
     *   - Avatar left (44px), text middle (truncated), action right (post thumbnail or delete)
     *   - Unread = slightly blue-tinted bg row
     */
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 cursor-pointer
        active:bg-gray-100 dark:active:bg-neutral-800 transition
        ${notification.isRead ? "bg-white dark:bg-black" : "bg-blue-50 dark:bg-blue-950"}
      `}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {sender?.profilePicture ? (
          <img
            src={sender.profilePicture}
            alt={sender.name ?? "User"}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-base font-semibold text-gray-500 dark:text-neutral-300">
            {sender?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-neutral-100 leading-snug line-clamp-2">
          <span className="font-semibold">{sender?.username ?? "Someone"}</span>
          {" "}
          {actionText(notification)}
          {" "}
          {notification.createdAt && (
            <span className="text-gray-400 font-normal">
              {relativeTime(notification.createdAt)}
            </span>
          )}
        </p>
      </div>

      {/* Right: post thumbnail (if available) or delete button */}
      <div className="shrink-0 ml-1">
        {notification.post?.images?.[0]?.url ? (
          <img
            src={notification.post.images[0].url}
            alt="post"
            className="w-11 h-11 object-cover rounded-sm"
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-red-500 transition"
            aria-label="Delete notification"
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
