import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationCard from "../../components/organisms/NotificationCard";
import PostDetailsModal from "../../components/organisms/PostDetailsModal";
import {
  useDeleteNotification,
  useMarkNotificationAsRead,
  useNotifications,
} from "../../hooks/useNotification";

const Notifications = () => {
  const navigate = useNavigate();

  const { data, isLoading }   = useNotifications();
  const markRead              = useMarkNotificationAsRead();
  const deleteNotification    = useDeleteNotification();

  const notifications = data?.notifications || [];
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white min-h-full">

        {/* ── Header ─────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 flex items-center" style={{ height: 48 }}>
          <h1 className="text-base font-semibold text-gray-900">Activity</h1>
        </div>

        {/* ── Body ───────────────────────────────── */}
        {isLoading ? (
          /* Skeleton */
          <div className="px-4 py-3 space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="w-11 h-11 rounded-sm bg-gray-100 shrink-0" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="text-5xl mb-4">🔔</div>
            <p className="font-semibold text-gray-800 mb-1">Activity on your posts</p>
            <p className="text-sm text-gray-400 leading-snug">
              When someone likes or comments on one of your posts, you'll see it here.
            </p>
          </div>
        ) : (
          <div>
            {notifications.map((n: any) => (
              <NotificationCard
                key={n._id}
                notification={n}
                onDelete={() => deleteNotification.mutate(n._id)}
                onClick={() => {
                  if (!n.isRead) markRead.mutate(n._id);

                  if (n.type === "follow" && n.sender?._id) {
                    navigate(`/profile/${n.sender._id}`);
                    return;
                  }
                  if (n.type === "message") {
                    navigate(n.conversation ? `/messages/${n.conversation}` : "/messages");
                    return;
                  }
                  if (n.post?._id) setOpenPostId(n.post._id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {openPostId && (
        <PostDetailsModal
          postId={openPostId}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </>
  );
};

export default Notifications;
