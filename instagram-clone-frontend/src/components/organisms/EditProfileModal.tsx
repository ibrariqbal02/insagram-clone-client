import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Camera } from "lucide-react";

import {
  useChangePassword,
  useDeleteAccount,
  useUpdateProfile,
} from "../../hooks/useAuth";

import { useUpdatePrivacy } from "../../hooks/useProfile";

import { getErrorMessage } from "../../utils/getErrorMessage";

type User = {
  _id: string;
  name: string;
  username: string;
  bio: string;
  profilePicture: string;
  isPrivate: boolean;
};

type Props = {
  user: User;
  onClose: () => void;
};

const EditProfileModal = ({ user, onClose }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // -----------------------------
  // Mutations
  // -----------------------------

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const updatePrivacyMutation = useUpdatePrivacy();

  // -----------------------------
  // Profile State
  // -----------------------------

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(user.profilePicture);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------
  // Password State
  // -----------------------------

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState<string | null>(
    null
  );

  const [isPasswordError, setIsPasswordError] = useState(false);

  // -----------------------------
  // Error State
  // -----------------------------

  const [profileError, setProfileError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // -----------------------------
  // Image Preview
  // -----------------------------

  useEffect(() => {
    if (!image) return;

    const url = URL.createObjectURL(image);

    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  // -----------------------------
  // Update Profile
  // -----------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setProfileError(null);

    const formData = new FormData();

    formData.append("name", name);
    formData.append("username", username);
    formData.append("bio", bio);
    formData.append("userId", user._id);

    if (image) {
      formData.append("profilePicture", image);
    }

    updateProfile.mutate(formData, {
      onSuccess: () => {
        onClose();
      },

      onError: (error) => {
        setProfileError(
          getErrorMessage(error, "Could not update profile.")
        );
      },
    });
  };

  // -----------------------------
  // Change Password
  // -----------------------------

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordMessage(null);
    setIsPasswordError(false);

    if (!currentPassword || !newPassword) {
      return;
    }

    changePassword.mutate(
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          setPasswordMessage("Password changed successfully.");
          setIsPasswordError(false);

          setCurrentPassword("");
          setNewPassword("");
        },

        onError: (error) => {
          setPasswordMessage(
            getErrorMessage(error, "Could not change password.")
          );

          setIsPasswordError(true);
        },
      }
    );
  };

  // -----------------------------
  // Change Privacy
  // -----------------------------

  const handlePrivacyChange = () => {
    const newPrivacyValue = !user.isPrivate;

    console.log("Current privacy:", user.isPrivate);
    console.log("New privacy:", newPrivacyValue);

    updatePrivacyMutation.mutate(newPrivacyValue, {
      onSuccess: (data) => {
        console.log("Privacy updated successfully:", data);

        // Refresh logged-in user's profile
        queryClient.invalidateQueries({
          queryKey: ["profile"],
        });
      },

      onError: (error) => {
        console.error("Privacy update failed:", error);
      },
    });
  };

  // -----------------------------
  // Delete Account
  // -----------------------------

  const handleDeleteAccount = () => {
    const ok = window.confirm(
      "Delete your account permanently? This removes your posts, comments and notifications and cannot be undone."
    );

    if (!ok) return;

    setDeleteError(null);

    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();

        navigate("/login");
      },

      onError: (error) => {
        setDeleteError(
          getErrorMessage(error, "Could not delete account.")
        );
      },
    });
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:bg-black/50 md:px-4 md:py-10">
      <div className="bg-white w-full md:rounded-xl md:max-w-lg p-6 overflow-y-auto" style={{ maxHeight: "100dvh" }}>

        {/* ================================= */}
        {/* Header */}
        {/* ================================= */}

        <h2 className="text-2xl font-bold mb-6">
          Edit Profile
        </h2>

        {/* ================================= */}
        {/* Edit Profile Form */}
        {/* ================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Profile Picture */}

          <div className="flex flex-col items-center gap-3">

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-28 h-28 rounded-full overflow-hidden cursor-pointer border"
            >

              {preview ? (
                <img
                  src={preview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">

                <Camera
                  size={24}
                  className="text-white"
                />

              </div>

            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Change profile photo
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                setImage(e.target.files?.[0] || null);
              }}
            />

          </div>

          {/* Name */}

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full border rounded-lg px-4 py-3"
          />

          {/* Username */}

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full border rounded-lg px-4 py-3"
          />

          {/* Bio */}

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Bio"
            className="w-full border rounded-lg px-4 py-3"
          />

          {/* Profile Error */}

          {profileError && (
            <p className="text-sm text-red-500">
              {profileError}
            </p>
          )}

          {/* Buttons */}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {updateProfile.isPending
                ? "Saving..."
                : "Save"}
            </button>

          </div>

        </form>

        {/* ================================= */}
        {/* Change Password */}
        {/* ================================= */}

        <div className="mt-8 border-t pt-6">

          <h3 className="text-lg font-semibold mb-4">
            Change Password
          </h3>

          <form
            onSubmit={handleChangePassword}
            className="space-y-3"
          >

            {/* Current Password */}

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Current password"
              className="w-full border rounded-lg px-4 py-3"
            />

            {/* New Password */}

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="New password"
              className="w-full border rounded-lg px-4 py-3"
            />

            {/* Password Message */}

            {passwordMessage && (
              <p
                className={`text-sm ${
                  isPasswordError
                    ? "text-red-500"
                    : "text-gray-600"
                }`}
              >
                {passwordMessage}
              </p>
            )}

            {/* Update Password */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={changePassword.isPending}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                {changePassword.isPending
                  ? "Updating..."
                  : "Update Password"}
              </button>

            </div>

          </form>

        </div>

        {/* ================================= */}
        {/* Privacy */}
        {/* ================================= */}

        <div className="mt-8 border-t pt-6">

          <h3 className="text-lg font-semibold mb-2">
            Privacy
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            {user.isPrivate
              ? "Your profile is currently private."
              : "Your profile is currently public."}
          </p>

          <button
            type="button"
            onClick={handlePrivacyChange}
            disabled={updatePrivacyMutation.isPending}
            className="w-full rounded-lg border px-5 py-3 hover:bg-gray-100 disabled:opacity-50"
          >
            {updatePrivacyMutation.isPending
              ? "Updating..."
              : user.isPrivate
              ? "Make Profile Public"
              : "Make Profile Private"}
          </button>

        </div>

        {/* ================================= */}
        {/* Danger Zone */}
        {/* ================================= */}

        <div className="mt-8 border-t pt-6">

          <h3 className="text-lg font-semibold mb-2 text-red-600">
            Danger Zone
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account, posts,
            comments and notifications.
            This cannot be undone.
          </p>

          {deleteError && (
            <p className="text-sm text-red-500 mb-3">
              {deleteError}
            </p>
          )}

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteAccount.isPending}
            className="rounded-lg bg-red-600 text-white px-5 py-2 hover:bg-red-700 disabled:opacity-50"
          >
            {deleteAccount.isPending
              ? "Deleting..."
              : "Delete Account"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default EditProfileModal;