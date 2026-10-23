import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "../../hooks/useNotification";
import { useMyProfile } from "../../hooks/useProfile";
import api from "../../api/axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [collapsed,   setCollapsed]   = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close "More" menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: notifData } = useNotifications();
  const { data: profileData } = useMyProfile();

  const unreadCount =
    notifData?.notifications?.filter((n: any) => !n.isRead).length ?? 0;

  const profilePicture = profileData?.user?.profilePicture;
  const username = profileData?.user?.username;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — redirect regardless
    }
    queryClient.clear();
    navigate("/login");
  };

  // Collapse sidebar on the messages route so the chat gets more space
  const isMessages = location.pathname.startsWith("/messages");
  const isNarrow = collapsed || isMessages;

  // Desktop sidebar nav — matches real Instagram's order exactly
  const navItems = [
    { name: "Home",          icon: Home,          path: "/" },
    { name: "Search",        icon: Search,        path: "/search" },
    { name: "Explore",       icon: Compass,       path: "/search" },
    { name: "Reels",         icon: Film,          path: "/reels" },
    { name: "Messages",      icon: MessageCircle, path: "/messages" },
    { name: "Notifications", icon: Heart,         path: "/notification" },
    { name: "Create",        icon: PlusSquare,    path: "/create-post" },
  ];

  // ─────────────────────────────────────────────────────────
  // Mobile bottom tab — 6 icons (real Instagram has messages too)
  // ─────────────────────────────────────────────────────────
  const mobileTabItems = [
    { name: "Home",          icon: Home,          path: "/" },
    { name: "Search",        icon: Search,        path: "/search" },
    { name: "Create",        icon: PlusSquare,    path: "/create-post" },
    { name: "Messages",      icon: MessageCircle, path: "/messages" },
    { name: "Notifications", icon: Heart,         path: "/notification" },
    { name: "Profile",       icon: null,          path: "/profile" },
  ];

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-0 h-screen
          border-r border-gray-200 dark:border-neutral-800
          bg-white dark:bg-black
          flex-col justify-between z-40 transition-all duration-200
          ${isNarrow ? "w-[72px] px-3 py-5" : "w-[245px] px-4 py-5"}
        `}
      >
        <div className="flex flex-col gap-1">
          {/* Logo */}
          <div
            className={`mb-6 flex items-center ${
              isNarrow ? "justify-center h-12" : "h-12 px-2"
            }`}
          >
            {isNarrow ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-7 h-7"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            ) : (
              <span className="font-logo text-3xl leading-none select-none">
                Instagram
              </span>
            )}
          </div>

          {/* Nav links */}
          {navItems.map(({ name, icon: Icon, path }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);
            const showBadge = name === "Notifications" && unreadCount > 0;

            return (
              <NavLink
                key={name}
                to={path}
                className={`
                  flex items-center gap-4 rounded-lg py-3 transition-colors
                  hover:bg-gray-100 dark:hover:bg-neutral-900
                  ${isNarrow ? "justify-center px-0" : "px-3"}
                  ${isActive ? "font-semibold" : "font-normal"}
                `}
              >
                <span className="relative shrink-0">
                  <Icon
                    size={26}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-black dark:text-white" : "text-gray-800 dark:text-neutral-300"}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {!isNarrow && <span className="text-sm dark:text-neutral-200">{name}</span>}
              </NavLink>
            );
          })}

          {/* Profile link */}
          <NavLink
            to="/profile"
            className={`
              flex items-center gap-4 rounded-lg py-3 transition-colors
              hover:bg-gray-100 dark:hover:bg-neutral-900
              ${isNarrow ? "justify-center px-0" : "px-3"}
              ${location.pathname.startsWith("/profile") ? "font-semibold" : "font-normal"}
            `}
          >
            <span className="shrink-0">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="profile"
                  className={`rounded-full object-cover border-2 w-7 h-7 ${
                    location.pathname.startsWith("/profile")
                      ? "border-black dark:border-white"
                      : "border-transparent"
                  }`}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-neutral-300">
                  {username?.[0]?.toUpperCase() ?? <User size={16} />}
                </div>
              )}
            </span>
            {!isNarrow && <span className="text-sm dark:text-neutral-200">Profile</span>}
          </NavLink>
        </div>

        {/* Bottom: More (with popover) */}
        <div className="flex flex-col gap-1" ref={moreMenuRef}>

          {/* "More" popover menu */}
          {showMoreMenu && (
            <div
              className={`
                absolute bottom-20
                bg-white dark:bg-neutral-900
                border border-gray-200 dark:border-neutral-700
                rounded-xl shadow-lg z-50 py-2 min-w-[220px]
                ${isNarrow ? "left-16" : "left-4"}
              `}
            >
              <button
                onClick={() => { navigate("/settings"); setShowMoreMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
              >
                <Settings size={20} strokeWidth={1.8} />
                Settings
              </button>
              <div className="border-t border-gray-100 dark:border-neutral-700 my-1" />
              <button
                onClick={() => { handleLogout(); setShowMoreMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
              >
                <LogOut size={20} strokeWidth={1.8} />
                Log out
              </button>
            </div>
          )}

          <button
            onClick={() => { setCollapsed((v) => !v); setShowMoreMenu((v) => !v); }}
            className={`
              flex items-center gap-4 rounded-lg py-3 transition-colors
              hover:bg-gray-100 dark:hover:bg-neutral-900 w-full
              ${isNarrow ? "justify-center px-0" : "px-3"}
              ${showMoreMenu ? "bg-gray-100 dark:bg-neutral-900 font-semibold" : ""}
            `}
          >
            <Menu size={26} strokeWidth={showMoreMenu ? 2.2 : 1.8} className="shrink-0 text-gray-800 dark:text-neutral-300" />
            {!isNarrow && <span className="text-sm dark:text-neutral-200">More</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      {/*
        Real Instagram bottom bar:
          - Pure white background
          - 0.5 px top border
          - 6 equally-spaced icons (Home, Search, Create, Messages, Notifications, Profile)
          - Active icon is full black / filled; inactive is outlined gray
          - Bottom padding = safe-area-inset-bottom (home indicator space)
      */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          bg-white dark:bg-black
          border-t border-gray-200 dark:border-neutral-800
          flex justify-around items-center
          pl-safe pr-safe
        "
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          minHeight: 56,
        }}
      >
        {mobileTabItems.map(({ name, icon: Icon, path }) => {
          const isActive =
            path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(path);

          const showBadge = name === "Notifications" && unreadCount > 0;

          // Profile tab — show avatar when available
          if (name === "Profile") {
            return (
              <NavLink
                key="profile"
                to="/profile"
                className="relative flex items-center justify-center w-12 h-12"
                aria-label="Profile"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="profile"
                    className={`w-[26px] h-[26px] rounded-full object-cover ${
                      isActive
                        ? "ring-2 ring-black ring-offset-1"
                        : "ring-1 ring-gray-300"
                    }`}
                  />
                ) : (
                  <User
                    size={26}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-neutral-400"}
                  />
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={name}
              to={path}
              className="relative flex items-center justify-center w-12 h-12"
              aria-label={name}
            >
              {/* Create post — Instagram uses a slightly different box icon */}
              {Icon && (
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? "text-black dark:text-white" : "text-gray-600 dark:text-neutral-400"}
                  fill={
                    (name === "Home" || name === "Notifications") && isActive
                      ? "currentColor"
                      : "none"
                  }
                />
              )}
              {showBadge && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
