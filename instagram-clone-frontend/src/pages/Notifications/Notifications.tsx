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

  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.notifications || [];

  const [openPostId, setOpenPostId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n: any) => (
            <NotificationCard
              key={n._id}
              notification={n}
              onDelete={() => deleteNotification.mutate(n._id)}
              onClick={() => {
                if (!n.isRead) {
                  markRead.mutate(n._id);
                }

                if (n.type === "follow" && n.sender?._id) {
                  navigate(`/profile/${n.sender._id}`);
                  return;
                }

                if (n.type === "message") {
                  navigate(n.conversation ? `/messages/${n.conversation}` : "/messages");
                  return;
                }

                if (n.post?._id) {
                  setOpenPostId(n.post._id);
                }
              }}
            />
          ))
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
