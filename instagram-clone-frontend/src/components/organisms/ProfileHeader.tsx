import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Settings } from "lucide-react";

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
      /* Skeleton */
      <div className="px-4 pt-4 pb-2 animate-pulse">
        <div className="flex items-center gap-7 mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 flex justify-around">
            {[0,1,2].map(i => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-4 bg-gray-200 rounded" />
                <div className="w-12 h-3 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-3.5 bg-gray-200 rounded w-28 mb-1.5" />
        <div className="h-3 bg-gray-100 rounded w-48 mb-3" />
        <div className="h-9 bg-gray-100 rounded-lg w-full" />
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
  const isLockedProfile = profile.isPrivate === true && !isMe;

  const isFollowing =
    user.followers?.some((id: string) => id === myProfile?.user?._id) || false;

  const handleFollow = () => followUser.mutate(user._id);

  const handleMessage = () => {
    createConversation.mutate(user._id, {
      onSuccess: (data) => navigate(`/messages/${data.conversation._id}`),
    });
  };

  const postCount   = isLockedProfile ? "—" : (posts?.posts?.length ?? 0);
  const followerCount = user.followers?.length ?? 0;
  const followingCount = user.following?.length ?? 0;

  return (
    <>
      {/*
        Real Instagram mobile profile layout:
          Row 1: avatar (left) + stats (right, 3 cols)
          Row 2: display name + bio
          Row 3: action buttons (full-width)
          ── all inside a white block with standard padding
      */}
      <div className="bg-white px-4 pt-4 pb-3">

        {/* ── Row 1: avatar + stats ───────────────────── */}
        <div className="flex items-center gap-6 mb-3">

          {/* Avatar */}
          <div className="shrink-0">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-[86px] h-[86px] rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-[86px] h-[86px] rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500 border border-gray-200">
                {user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="flex-1 flex justify-around text-center">
            {/* Posts */}
            <div>
              <p className="text-base font-bold leading-tight">
                {postCount}
              </p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">
                Posts
              </p>
            </div>

            {/* Followers */}
            <button
              disabled={!!isLockedProfile}
              onClick={() => !isLockedProfile && setShowFollowers(true)}
              className="flex flex-col items-center disabled:cursor-default"
            >
              <p className="text-base font-bold leading-tight">
                {followerCount >= 1000
                  ? `${(followerCount / 1000).toFixed(1)}K`
                  : followerCount}
              </p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">
                Followers
              </p>
            </button>

            {/* Following */}
            <button
              disabled={!!isLockedProfile}
              onClick={() => !isLockedProfile && setShowFollowing(true)}
              className="flex flex-col items-center disabled:cursor-default"
            >
              <p className="text-base font-bold leading-tight">
                {followingCount >= 1000
                  ? `${(followingCount / 1000).toFixed(1)}K`
                  : followingCount}
              </p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">
                Following
              </p>
            </button>
          </div>
        </div>

        {/* ── Row 2: name + private badge + bio ───────── */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm leading-tight">
              {user.name}
            </span>
            {user.isPrivate && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500">
                <Lock size={11} />
                Private
              </span>
            )}
          </div>

          {!isLockedProfile && user.bio && (
            <p className="text-sm text-gray-800 mt-0.5 leading-snug whitespace-pre-line">
              {user.bio}
            </p>
          )}
        </div>

        {/* ── Row 3: action buttons ────────────────────── */}
        {isMe ? (
          /* Own profile: Edit + Settings side by side */
          <div className="flex gap-2">
            <button
              onClick={onEditClick}
              className="flex-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition rounded-lg py-1.5"
            >
              Edit profile
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center justify-center w-10 bg-gray-100 hover:bg-gray-200 transition rounded-lg"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        ) : (
          /* Other user: Follow / Following + Message */
          <div className="flex gap-2">
            <button
              onClick={handleFollow}
              disabled={followUser.isPending}
              className={`flex-1 text-sm font-semibold rounded-lg py-1.5 transition ${
                isFollowing
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  : "bg-[#0095f6] hover:bg-[#1877f2] text-white"
              }`}
            >
              {followUser.isPending
                ? "..."
                : isFollowing
                ? "Following"
                : "Follow"}
            </button>

            <button
              onClick={handleMessage}
              disabled={createConversation.isPending}
              className="flex-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition rounded-lg py-1.5"
            >
              {createConversation.isPending ? "..." : "Message"}
            </button>
          </div>
        )}
      </div>

      {showFollowers && (
        <FollowersModal userId={user._id} onClose={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <FollowingModal userId={user._id} onClose={() => setShowFollowing(false)} />
      )}
    </>
  );
};

export default ProfileHeader;
