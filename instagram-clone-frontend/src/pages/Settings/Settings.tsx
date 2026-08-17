import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Lock,
  Bell,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Globe,
  X,
  ChevronLeft,
} from "lucide-react";

import { useDeleteAccount } from "../../hooks/useAuth";
import { useMyProfile } from "../../hooks/useProfile";
import { useTheme } from "../../context/ThemeContext";
import api from "../../api/axios";
import { getErrorMessage } from "../../utils/getErrorMessage";
import EditProfileModal from "../../components/organisms/EditProfileModal";

type Section = "main" | "privacy" | "notifications" | "about";

const Settings = () => {
  const navigate     = useNavigate();
  const queryClient  = useQueryClient();
  const { isDark, toggleTheme } = useTheme();

  const { data: profileData } = useMyProfile();
  const me = profileData?.user;

  const deleteAccount = useDeleteAccount();

  const [section,        setSection]        = useState<Section>("main");
  const [showEditModal,  setShowEditModal]  = useState(false);
  const [deleteError,    setDeleteError]    = useState<string | null>(null);

  // ── Logout ───────────────────────────────────────────────
  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    queryClient.clear();
    navigate("/login");
  };

  // ── Delete account ───────────────────────────────────────
  const handleDeleteAccount = () => {
    const ok = window.confirm(
      "Permanently delete your account, posts, comments and notifications? This cannot be undone."
    );
    if (!ok) return;
    setDeleteError(null);
    deleteAccount.mutate(undefined, {
      onSuccess: () => { queryClient.clear(); navigate("/login"); },
      onError: (err) => setDeleteError(getErrorMessage(err, "Could not delete account.")),
    });
  };

  /* ── Shared row component ────────────────────────────── */
  const Row = ({
    icon: Icon,
    label,
    sublabel,
    onClick,
    chevron = true,
    danger = false,
    rightSlot,
  }: {
    icon: React.ElementType;
    label: string;
    sublabel?: string;
    onClick?: () => void;
    chevron?: boolean;
    danger?: boolean;
    rightSlot?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 px-4 py-3.5
        active:bg-gray-50 dark:active:bg-neutral-900 transition text-left
        ${danger ? "text-red-500" : "text-gray-900 dark:text-white"}
      `}
    >
      <span className={`shrink-0 ${danger ? "text-red-500" : "text-gray-600 dark:text-neutral-400"}`}>
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-500" : "text-gray-900 dark:text-white"}`}>
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-400 dark:text-neutral-500 leading-snug mt-0.5">{sublabel}</p>
        )}
      </div>
      {rightSlot ?? (chevron && !danger && (
        <ChevronRight size={18} className="text-gray-400 dark:text-neutral-500 shrink-0" />
      ))}
    </button>
  );

  /* ── Animated toggle switch ─────────────────────────── */
  const Toggle = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      role="switch"
      aria-checked={checked}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-blue-500
        ${checked ? "bg-[#0095f6]" : "bg-gray-300 dark:bg-neutral-600"}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0.5"}
        `}
      />
    </button>
  );

  const SectionHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-800 px-4 flex items-center gap-3" style={{ height: 52 }}>
      <button onClick={onBack} className="p-1 -ml-1 text-gray-700 dark:text-neutral-300">
        <ChevronLeft size={24} />
      </button>
      <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>
    </div>
  );

  /* ── Privacy sub-screen ──────────────────────────────── */
  if (section === "privacy") {
    return (
      <div className="bg-white dark:bg-black min-h-full">
        <SectionHeader title="Privacy" onBack={() => setSection("main")} />
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <Row
            icon={Lock}
            label="Account privacy"
            sublabel={me?.isPrivate ? "Private account" : "Public account"}
            onClick={() => { if (me) setShowEditModal(true); }}
          />
          <Row icon={Globe} label="Blocked accounts" sublabel="Manage blocked users" onClick={() => {}} />
        </div>

        {showEditModal && me && (
          <EditProfileModal user={me} onClose={() => setShowEditModal(false)} />
        )}
      </div>
    );
  }

  /* ── Notifications sub-screen ───────────────────────── */
  if (section === "notifications") {
    return (
      <div className="bg-white dark:bg-black min-h-full">
        <SectionHeader title="Notifications" onBack={() => setSection("main")} />
        <div className="px-4 py-6 text-sm text-gray-500 dark:text-neutral-400 text-center">
          Notification preferences coming soon.
        </div>
      </div>
    );
  }

  /* ── About sub-screen ────────────────────────────────── */
  if (section === "about") {
    return (
      <div className="bg-white dark:bg-black min-h-full">
        <SectionHeader title="About" onBack={() => setSection("main")} />
        <div className="px-4 py-6 space-y-2 text-sm text-gray-600 dark:text-neutral-300">
          <p><span className="font-semibold">App:</span> Instagram Clone</p>
          <p><span className="font-semibold">Version:</span> 1.0.0</p>
          <p className="text-gray-400 dark:text-neutral-500 text-xs mt-4">
            This is a demo project and is not affiliated with Instagram or Meta.
          </p>
        </div>
      </div>
    );
  }

  /* ── Main settings screen ────────────────────────────── */
  return (
    <div className="bg-white dark:bg-black min-h-full">

      {/* Header */}
      <div
        className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-800 px-4 flex items-center justify-between"
        style={{ height: 52 }}
      >
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">Settings</h1>
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-700 dark:text-neutral-300 lg:hidden"
          aria-label="Back"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-700 dark:text-neutral-300 hidden lg:block"
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* Account section */}
      <div className="mt-2">
        <p className="px-4 pb-1 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
          Account
        </p>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800 border-t border-b border-gray-100 dark:border-neutral-800">
          <Row
            icon={Shield}
            label="Edit Profile"
            sublabel="Update your name, username, bio and photo"
            onClick={() => { if (me) setShowEditModal(true); }}
          />
          <Row
            icon={Lock}
            label="Privacy"
            sublabel="Control who can see your content"
            onClick={() => setSection("privacy")}
          />
          <Row
            icon={Bell}
            label="Notifications"
            sublabel="Manage push and in-app alerts"
            onClick={() => setSection("notifications")}
          />
        </div>
      </div>

      {/* Preferences section */}
      <div className="mt-6">
        <p className="px-4 pb-1 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
          Preferences
        </p>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800 border-t border-b border-gray-100 dark:border-neutral-800">
          {/* Dark mode — with real working toggle */}
          <Row
            icon={isDark ? Moon : Sun}
            label="Dark mode"
            sublabel={isDark ? "On — tap to switch to light" : "Off — tap to switch to dark"}
            onClick={toggleTheme}
            chevron={false}
            rightSlot={<Toggle checked={isDark} onToggle={toggleTheme} />}
          />
          <Row
            icon={Globe}
            label="Language"
            sublabel="English"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Support section */}
      <div className="mt-6">
        <p className="px-4 pb-1 text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wide">
          Support
        </p>
        <div className="divide-y divide-gray-100 dark:divide-neutral-800 border-t border-b border-gray-100 dark:border-neutral-800">
          <Row icon={HelpCircle} label="Help" onClick={() => {}} />
          <Row
            icon={Info}
            label="About"
            onClick={() => setSection("about")}
          />
        </div>
      </div>

      {/* Log out */}
      <div className="mt-6 border-t border-b border-gray-100 dark:border-neutral-800 divide-y divide-gray-100 dark:divide-neutral-800">
        <Row
          icon={LogOut}
          label="Log out"
          onClick={handleLogout}
          chevron={false}
          danger
        />
      </div>

      {/* Delete account */}
      <div className="mt-4 border-t border-b border-gray-100 dark:border-neutral-800">
        <Row
          icon={Trash2}
          label="Delete account"
          sublabel="Permanently remove your account and all data"
          onClick={handleDeleteAccount}
          chevron={false}
          danger
        />
        {deleteError && (
          <p className="px-4 pb-3 text-sm text-red-500">{deleteError}</p>
        )}
      </div>

      <div className="h-12" />

      {showEditModal && me && (
        <EditProfileModal user={me} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
};

export default Settings;
