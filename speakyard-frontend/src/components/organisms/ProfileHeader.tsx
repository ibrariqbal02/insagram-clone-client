import { useNavigate } from "react-router-dom";
import { Flame, Clock, Phone, MapPin, Settings, Lock } from "lucide-react";

import { useMyProfile, useUserProfile } from "../../hooks/useProfile";
import { useFollowUser } from "../../hooks/useFollow";
import { useCreateConversation } from "../../hooks/useConversation";
import { usePracticeStats } from "../../hooks/useAuth";
import { goalLabel, levelLabel } from "../../data/english";
import { languageName } from "../../data/languages";
import Avatar from "../atoms/Avatar";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/Toast";

type Props = {
  userId: string;
  onEditClick?: () => void;
};

const Stat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string | number;
  label: string;
}) => (
  <div className="flex-1 flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-neutral-800/60 py-3">
    <Icon size={16} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
    <span className="text-base font-extrabold leading-none text-gray-900 dark:text-white">
      {value}
    </span>
    <span className="text-[11px] text-gray-500 dark:text-neutral-400 leading-none">{label}</span>
  </div>
);

const ProfileHeader = ({ userId, onEditClick }: Props) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: profile, isLoading } = useUserProfile(userId);
  const { data: myProfile } = useMyProfile();
  const { data: statsData } = usePracticeStats();

  const followUser = useFollowUser();
  const createConversation = useCreateConversation();

  if (isLoading) {
    return (
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-20 h-20" circle />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full mb-3" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (!profile?.user) {
    return (
      <div className="flex justify-center py-20 text-gray-500 dark:text-neutral-400 text-sm">
        We couldn't load this profile.
      </div>
    );
  }

  const user = profile.user;
  const isMe = myProfile?.user?._id === user._id;
  const isLockedProfile = profile.isPrivate === true && !isMe;

  const isFollowing =
    user.followers?.some((id: string) => id === myProfile?.user?._id) || false;

  const level = user.learningLanguages?.[0]?.level;
  const nativeLanguage = user.nativeLanguages?.[0];

  // Only the signed-in user's own stats are available for now.
  const stats = isMe ? statsData?.stats : undefined;

  const handleFollow = () => followUser.mutate(user._id);

  const handleMessage = () => {
    createConversation.mutate(user._id, {
      onSuccess: (data) => navigate(`/messages/${data.conversation._id}`),
      onError: () => showToast("Could not open that chat. Please try again.", "error"),
    });
  };

  return (
    <div className="px-4 pt-5 pb-4">
      {/* ── Identity ───────────────────────────────── */}
      <div className="flex items-center gap-4 mb-4">
        <Avatar src={user.profilePicture} name={user.name} size={20} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight truncate">
              {user.name}
            </h1>
            {user.isPrivate && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-neutral-400">
                <Lock size={11} />
                Private
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-neutral-400">@{user.username}</p>

          {level && (
            <span className="inline-block mt-1.5 text-xs font-bold rounded-full px-2.5 py-1 bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100">
              English {level} · {levelLabel(level)}
            </span>
          )}
        </div>
      </div>

      {/* ── Learner details ────────────────────────── */}
      {!isLockedProfile && (
        <div className="space-y-1.5 mb-4 text-sm text-gray-700 dark:text-neutral-300">
          {nativeLanguage && (
            <p>
              <span className="text-gray-500 dark:text-neutral-400">Speaks </span>
              <span className="font-semibold">{languageName(nativeLanguage)}</span>
            </p>
          )}

          {user.goal && (
            <p>
              <span className="text-gray-500 dark:text-neutral-400">Practising for </span>
              <span className="font-semibold">{goalLabel(user.goal)}</span>
            </p>
          )}

          {user.country && (
            <p className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400 shrink-0" aria-hidden="true" />
              <span>{user.country}</span>
            </p>
          )}

          {user.bio && (
            <p className="whitespace-pre-line leading-relaxed pt-1">{user.bio}</p>
          )}
        </div>
      )}

      {/* ── Practice stats ─────────────────────────── */}
      {isMe && (
        <div className="flex gap-2 mb-4">
          <Stat icon={Flame} value={stats?.streakDays ?? 0} label="day streak" />
          <Stat icon={Clock} value={stats?.minutesTotal ?? 0} label="minutes" />
          <Stat icon={Phone} value={stats?.callsCount ?? 0} label="calls" />
        </div>
      )}

      {/* ── Actions ────────────────────────────────── */}
      {isMe ? (
        <div className="flex gap-2">
          <button
            onClick={onEditClick}
            className="
              flex-1 min-h-[44px] text-sm font-bold bg-gray-100 dark:bg-neutral-800
              hover:bg-gray-200 dark:hover:bg-neutral-700 transition rounded-xl
              text-gray-900 dark:text-white
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
            "
          >
            Edit profile
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="
              w-11 min-h-[44px] flex items-center justify-center bg-gray-100 dark:bg-neutral-800
              hover:bg-gray-200 dark:hover:bg-neutral-700 transition rounded-xl text-gray-900 dark:text-white
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
            "
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleFollow}
            disabled={followUser.isPending}
            className={`flex-1 min-h-[44px] text-sm font-bold rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              isFollowing
                ? "bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white"
                : "bg-brand-600 hover:bg-brand-700 text-white"
            }`}
          >
            {followUser.isPending ? "…" : isFollowing ? "Following" : "Follow"}
          </button>

          <button
            onClick={handleMessage}
            disabled={createConversation.isPending}
            className="
              flex-1 min-h-[44px] text-sm font-bold bg-gray-100 dark:bg-neutral-800
              hover:bg-gray-200 dark:hover:bg-neutral-700 transition rounded-xl text-gray-900 dark:text-white
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
            "
          >
            {createConversation.isPending ? "…" : "Message"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
