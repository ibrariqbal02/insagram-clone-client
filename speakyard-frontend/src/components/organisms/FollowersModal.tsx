import { X } from "lucide-react";
import { Link } from "react-router-dom";

import { useMe } from "../../hooks/useAuth";
import { useFollowUser } from "../../hooks/useFollow";
import { useFollowers, useRemoveFollower } from "../../hooks/useProfile";

type Props = {
  userId: string;
  onClose: () => void;
};

const FollowersModal = ({ userId, onClose }: Props) => {
  const { data: me } = useMe();
  const myId = me?.user?._id;
  const myFollowing = me?.user?.following || [];

  const { data, isLoading } = useFollowers(userId);
  const followers = data?.followers || [];

  const followUser = useFollowUser();
  const removeFollower = useRemoveFollower();

  const isMyProfile = myId === userId;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Followers</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && <div>Loading...</div>}

          {!isLoading && followers.length === 0 && (
            <div className="text-center text-gray-500">No followers yet.</div>
          )}

          {followers.map((u: any) => {
            const isMe = u._id === myId;
            const isFollowing = myFollowing.some((id: string) => id === u._id);
            const isFollowRowLoading =
              followUser.isPending && followUser.variables === u._id;
            const isRemoveRowLoading =
              removeFollower.isPending && removeFollower.variables === u._id;

            return (
              <div key={u._id} className="flex items-center justify-between gap-3">
                <Link to={`/profile/${u._id}`} onClick={onClose} className="flex items-center gap-3">
                  <img
                    src={u.profilePicture}
                    alt={u.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div className="leading-tight">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-sm text-gray-500">@{u.username}</div>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  {!isMe && (
                    <button
                      onClick={() => followUser.mutate(u._id)}
                      disabled={isFollowRowLoading}
                      className={`px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60 ${
                        isFollowing ? "bg-gray-600" : "bg-blue-600"
                      }`}
                    >
                      {isFollowRowLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
                    </button>
                  )}

                  {isMyProfile && !isMe && (
                    <button
                      onClick={() => removeFollower.mutate(u._id)}
                      disabled={isRemoveRowLoading}
                      className="px-4 py-2 rounded-lg text-sm border disabled:opacity-60"
                    >
                      {isRemoveRowLoading ? "Loading..." : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
