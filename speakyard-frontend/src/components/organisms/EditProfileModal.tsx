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
import { LANGUAGES } from "../../data/languages";
import {
  ENGLISH_LEVELS,
  LEARNING_LANGUAGE_CODE,
  PRACTICE_GOALS,
} from "../../data/english";
import { useToast } from "../ui/Toast";

type User = {
  _id: string;
  name: string;
  username: string;
  bio: string;
  profilePicture: string;
  isPrivate: boolean;
  country?: string;
  goal?: string;
  nativeLanguages?: string[];
  learningLanguages?: { code: string; level: string }[];
};

type Props = {
  user: User;
  onClose: () => void;
};

const EditProfileModal = ({ user, onClose }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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
  const [country, setCountry] = useState(user.country ?? "");
  const [goal, setGoal] = useState(user.goal ?? "");
  const [nativeLanguage, setNativeLanguage] = useState(user.nativeLanguages?.[0] ?? "");
  const [englishLevel, setEnglishLevel] = useState(
    user.learningLanguages?.[0]?.level ?? ""
  );

  const [image,          setImage]          = useState<File | null>(null);
  const [preview,        setPreview]        = useState(user.profilePicture);
  const [removePhoto,    setRemovePhoto]    = useState(false);

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
    formData.append("country", country);
    formData.append("goal", goal);
    formData.append("userId", user._id);

    // Arrays go as JSON because this is a multipart request.
    if (nativeLanguage) {
      formData.append("nativeLanguages", JSON.stringify([nativeLanguage]));
    }
    if (englishLevel) {
      formData.append(
        "learningLanguages",
        JSON.stringify([{ code: LEARNING_LANGUAGE_CODE, level: englishLevel }])
      );
    }

    if (image) {
      formData.append("profilePicture", image);
    } else if (removePhoto) {
      // Tell the backend to delete the existing profile picture
      formData.append("removeProfilePicture", "true");
    }

    updateProfile.mutate(formData, {
      onSuccess: () => {
        showToast("Profile updated", "success");
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

            {/*
              Avatar — tappable on both mobile and desktop.
              We use a plain onClick (no group-hover) so it works on touch.
            */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full overflow-hidden border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label="Change profile photo"
            >
              {preview && !removePhoto ? (
                <img
                  src={preview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                  No photo
                </div>
              )}

              {/* Always-visible camera overlay so touch users see the affordance */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Camera size={24} className="text-white" />
              </div>
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Change photo
              </button>

              {/* Remove photo — only shown when a picture exists */}
              {(preview || user.profilePicture) && !removePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview("");
                    setRemovePhoto(true);
                  }}
                  className="text-sm font-semibold text-red-500 hover:text-red-600"
                >
                  Remove photo
                </button>
              )}

              {removePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setPreview(user.profilePicture);
                    setRemovePhoto(false);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Undo
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImage(file);
                setRemovePhoto(false);
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

          {/* Native language */}

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
              Language you speak
            </span>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="w-full border rounded-lg px-4 min-h-[44px] bg-white dark:bg-neutral-900"
            >
              <option value="">Not set</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </label>

          {/* English level */}

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
              English level
            </span>
            <select
              value={englishLevel}
              onChange={(e) => setEnglishLevel(e.target.value)}
              className="w-full border rounded-lg px-4 min-h-[44px] bg-white dark:bg-neutral-900"
            >
              <option value="">Not set</option>
              {ENGLISH_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.value} — {level.label}
                </option>
              ))}
            </select>
          </label>

          {/* Goal */}

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">
              Practising for
            </span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full border rounded-lg px-4 min-h-[44px] bg-white dark:bg-neutral-900"
            >
              <option value="">Not set</option>
              {PRACTICE_GOALS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {/* Country */}

          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="w-full border rounded-lg px-4 min-h-[44px]"
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
              className="bg-brand-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
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