import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Archive, Grid, Bookmark as BookmarkIcon } from "lucide-react";

import { useMyProfile, useUserProfile } from "../../hooks/useProfile";
import ProfileHeader from "../../components/organisms/ProfileHeader";
import ProfilePosts from "../../components/organisms/ProfilePosts";
import EditProfileModal from "../../components/organisms/EditProfileModal";

/**
 * Thin tab bar separating Posts / Saved — mirrors real Instagram.
 * "Saved" is only shown on own profile.
 */
const ProfileTabBar = ({
  isMe,
}: {
  isMe: boolean;
}) => (
  <div className="flex border-t border-gray-200 bg-white">
    {/* Posts tab — always active for now */}
    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-t-2 border-gray-900 text-gray-900">
      <Grid size={16} strokeWidth={1.8} />
      <span className="text-xs font-semibold uppercase tracking-wide hidden sm:inline">
        Posts
      </span>
    </button>

    {isMe && (
      <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-t-2 border-transparent text-gray-400">
        <BookmarkIcon size={16} strokeWidth={1.8} />
        <span className="text-xs font-semibold uppercase tracking-wide hidden sm:inline">
          Saved
        </span>
      </button>
    )}
  </div>
);

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data: myProfileData, isLoading: myLoading } = useMyProfile();
  const { data: otherProfileData, isLoading: otherLoading } = useUserProfile(userId ?? "");

  const [showEditModal, setShowEditModal] = useState(false);

  /* ── Own profile ─────────────────────────────── */
  if (!userId) {
    if (myLoading) {
      return (
        <div className="flex justify-center py-20 text-gray-500 text-sm">
          Loading profile...
        </div>
      );
    }

    const me = myProfileData?.user;

    if (!me) {
      return (
        <div className="flex justify-center py-20 text-gray-500 text-sm">
          Could not load profile.
        </div>
      );
    }

    return (
      <>
        <div className="bg-white">
          <ProfileHeader userId={me._id} onEditClick={() => setShowEditModal(true)} />
          <ProfileTabBar isMe />
          <ProfilePosts userId={me._id} />

          {/* Archive link — subtle, below posts */}
          <div className="flex justify-center py-6">
            <button
              onClick={() => navigate("/archive")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
            >
              <Archive size={15} />
              View Archive
            </button>
          </div>
        </div>

        {showEditModal && (
          <EditProfileModal
            user={me}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </>
    );
  }

  /* ── Another user's profile ──────────────────── */
  if (otherLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500 text-sm">
        Loading profile...
      </div>
    );
  }

  if (!otherProfileData?.user) {
    return (
      <div className="flex justify-center py-20 text-gray-500 text-sm">
        User not found.
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ProfileHeader userId={userId} />
      <ProfileTabBar isMe={false} />
      <ProfilePosts userId={userId} />
    </div>
  );
};

export default Profile;
