import { useState } from "react";
import { useParams } from "react-router-dom";
import { Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMyProfile, useUserProfile } from "../../hooks/useProfile";
import ProfileHeader from "../../components/organisms/ProfileHeader";
import ProfilePosts from "../../components/organisms/ProfilePosts";
import EditProfileModal from "../../components/organisms/EditProfileModal";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  // If there is no :userId in the URL we are viewing our own profile
  const { data: myProfileData, isLoading: myLoading } = useMyProfile();

  // When a userId param exists we are viewing someone else's profile
  const { data: otherProfileData, isLoading: otherLoading } = useUserProfile(
    userId ?? ""
  );

  const [showEditModal, setShowEditModal] = useState(false);

  // Own profile
  if (!userId) {
    if (myLoading) {
      return (
        <div className="flex justify-center py-20 text-gray-500">
          Loading profile...
        </div>
      );
    }

    const me = myProfileData?.user;

    if (!me) {
      return (
        <div className="flex justify-center py-20 text-gray-500">
          Could not load profile.
        </div>
      );
    }

    return (
      <>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ProfileHeader expects a userId — pass own id */}
          <ProfileHeader
            userId={me._id}
            onEditClick={() => setShowEditModal(true)}
          />
          <ProfilePosts userId={me._id} />
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/archive")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            <Archive size={18} />
            Archive
          </button>
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

  // Another user's profile
  if (otherLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!otherProfileData?.user) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader userId={userId} />
      <ProfilePosts userId={userId} />
    </div>
  );
};

export default Profile;
