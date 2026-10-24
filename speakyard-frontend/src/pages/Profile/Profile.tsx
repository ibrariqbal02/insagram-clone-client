import { useState } from "react";
import { useParams } from "react-router-dom";

import { useMyProfile, useUserProfile } from "../../hooks/useProfile";
import ProfileHeader from "../../components/organisms/ProfileHeader";
import EditProfileModal from "../../components/organisms/EditProfileModal";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";

const ProfileSkeleton = () => (
  <div className="px-4 pt-5">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-20 h-20" circle />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
);

/**
 * Learner profile — who someone is and how they're practising.
 * The old posts grid / saved / archive tabs were dropped in the 2.3b UX pass
 * (the post pages themselves still exist, just not linked from here).
 */
const Profile = () => {
  const { userId } = useParams();

  const { data: myProfileData, isLoading: myLoading } = useMyProfile();
  const { data: otherProfileData, isLoading: otherLoading } = useUserProfile(userId ?? "");

  const [showEditModal, setShowEditModal] = useState(false);

  /* ── Own profile ─────────────────────────────── */
  if (!userId) {
    if (myLoading) return <ProfileSkeleton />;

    const me = myProfileData?.user;

    if (!me) {
      return (
        <EmptyState
          emoji="🙁"
          title="We couldn't load your profile"
          description="Check your connection and refresh the page."
        />
      );
    }

    return (
      <>
        <div className="bg-white dark:bg-neutral-900 md:rounded-2xl md:border md:border-gray-200 md:dark:border-neutral-800 max-w-2xl mx-auto w-full md:mt-6">
          <ProfileHeader userId={me._id} onEditClick={() => setShowEditModal(true)} />
        </div>

        {showEditModal && (
          <EditProfileModal user={me} onClose={() => setShowEditModal(false)} />
        )}
      </>
    );
  }

  /* ── Another learner's profile ───────────────── */
  if (otherLoading) return <ProfileSkeleton />;

  if (!otherProfileData?.user) {
    return (
      <EmptyState
        emoji="🔍"
        title="Profile not found"
        description="This learner may have deleted their account."
      />
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 md:rounded-2xl md:border md:border-gray-200 md:dark:border-neutral-800 max-w-2xl mx-auto w-full md:mt-6">
      <ProfileHeader userId={userId} />
    </div>
  );
};

export default Profile;
