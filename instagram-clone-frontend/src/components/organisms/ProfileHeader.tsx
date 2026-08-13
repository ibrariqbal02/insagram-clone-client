import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

import {
  useMyProfile,
  useUserPosts,
  useUserProfile,
} from "../../hooks/useProfile";

import { useFollowUser } from "../../hooks/useFollow";
import { useCreateConversation } from "../../hooks/useConversation";
import FollowersModal from "./FollowersModal";
import FollowingModal from "./FollowingModal";

type Props = {
  userId: string;
  onEditClick?: () => void;
};

const ProfileHeader = ({ userId, onEditClick }: Props) => {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useUserProfile(userId);
  const { data: myProfile } = useMyProfile();
  const { data: posts } = useUserPosts(userId);

  const followUser = useFollowUser();
  const createConversation = useCreateConversation();

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        User not found.
      </div>
    );
  }

  const user = profile.user;
  const isMe = myProfile?.user?._id === user._id;

  // Backend sets isPrivate:true on the response when the viewer is locked out
  const isLockedProfile = profile.isPrivate === true && !isMe;

  const isFollowing =
    user.followers?.some(
      (id: string) => id === myProfile?.user?._id
    ) || false;

  const handleFollow = () => {
    followUser.mutate(user._id);
  };

  const handleMessage = () => {
    createConversation.mutate(user._id, {
      onSuccess: (data) => {
        navigate(`/messages/${data.conversation._id}`);
      },
    });
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow">
      <div className="flex flex-col gap-8 md:flex-row">

        {/* Avatar */}
        <div className="flex justify-center">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-40 w-40 rounded-full border object-cover"
            />
          ) : (
            <div className="h-40 w-40 rounded-full border bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500">
              {user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold">{user.name}</h1>

            {/* Private badge */}
            {user.isPrivate && (
              <span className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                <Lock size={14} />
                Private
              </span>
            )}

            {isMe ? (
              <button
                onClick={onEditClick}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  disabled={followUser.isPending}
                  className={`rounded-lg px-5 py-2 text-white transition ${
                    isFollowing
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {followUser.isPending
                    ? "Loading..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>

                <button
                  onClick={handleMessage}
                  disabled={createConversation.isPending}
                  className="rounded-lg border px-5 py-2 hover:bg-gray-100"
                >
                  {createConversation.isPending ? "Opening..." : "Message"}
                </button>
              </>
            )}
          </div>

          <p className="mt-2 text-gray-500">@{user.username}</p>

          {/* Bio — hidden for locked private profiles */}
          {!isLockedProfile && (
            <p className="mt-4">{user.bio || "No bio yet."}</p>
          )}

          {/* Stats */}
          <div className="mt-8 flex gap-10">
            <div>
              <h2 className="text-xl font-bold">
                {isLockedProfile ? "—" : (posts?.posts?.length ?? 0)}
              </h2>
              <p className="text-gray-500">Posts</p>
            </div>

            <button
              onClick={() => !isLockedProfile && setShowFollowers(true)}
              className={`text-left ${isLockedProfile ? "cursor-default" : ""}`}
            >
              <h2 className="text-xl font-bold">
                {user.followers?.length ?? 0}
              </h2>
              <p className="text-gray-500">Followers</p>
            </button>

            <button
              onClick={() => !isLockedProfile && setShowFollowing(true)}
              className={`text-left ${isLockedProfile ? "cursor-default" : ""}`}
            >
              <h2 className="text-xl font-bold">
                {user.following?.length ?? 0}
              </h2>
              <p className="text-gray-500">Following</p>
            </button>
          </div>
        </div>
      </div>

      {showFollowers && (
        <FollowersModal userId={user._id} onClose={() => setShowFollowers(false)} />
      )}

      {showFollowing && (
        <FollowingModal userId={user._id} onClose={() => setShowFollowing(false)} />
      )}
    </div>
  );
};

export default ProfileHeader;
