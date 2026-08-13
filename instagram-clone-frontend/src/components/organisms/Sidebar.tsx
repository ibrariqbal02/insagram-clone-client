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
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useNotifications } from "../../hooks/useNotification";
import { useMyProfile } from "../../hooks/useProfile";
import api from "../../api/axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
    navigate("/login");
  };

  // Collapse sidebar on the messages route so the chat gets more space
  const isMessages = location.pathname.startsWith("/messages");
  const isNarrow = collapsed || isMessages;

  const navItems = [
    { name: "Home",          icon: Home,          path: "/" },
    { name: "Search",        icon: Search,        path: "/search" },
    { name: "Explore",       icon: Compass,       path: "/search" },
    { name: "Reels",         icon: Film,          path: "/" },
    { name: "Messages",      icon: MessageCircle, path: "/messages" },
    { name: "Notifications", icon: Heart,         path: "/notification" },
    { name: "Create",        icon: PlusSquare,    path: "/create-post" },
  ];

  // ─────────────────────────────────────────────────────────
  // Mobile bottom tab items (5 icons like real Instagram)
  // ─────────────────────────────────────────────────────────
  const mobileTabItems = [
    { name: "Home",          icon: Home,          path: "/" },
    { name: "Search",        icon: Search,        path: "/search" },
    { name: "Create",        icon: PlusSquare,    path: "/create-post" },
    { name: "Notifications", icon: Heart,         path: "/notification" },
    { name: "Profile",       icon: null,          path: "/profile" },
  ];

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-0 h-screen border-r border-gray-200 bg-white
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
                  hover:bg-gray-100
                  ${isNarrow ? "justify-center px-0" : "px-3"}
                  ${isActive ? "font-semibold" : "font-normal"}
                `}
              >
                <span className="relative shrink-0">
                  <Icon
                    size={26}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? "text-black" : "text-gray-800"}
                  />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                {!isNarrow && <span className="text-sm">{name}</span>}
              </NavLink>
            );
          })}

          {/* Profile link */}
          <NavLink
            to="/profile"
            className={`
              flex items-center gap-4 rounded-lg py-3 transition-colors hover:bg-gray-100
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
                      ? "border-black"
                      : "border-transparent"
                  }`}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {username?.[0]?.toUpperCase() ?? <User size={16} />}
                </div>
              )}
            </span>
            {!isNarrow && <span className="text-sm">Profile</span>}
          </NavLink>
        </div>

        {/* Bottom: More + Logout */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`
              flex items-center gap-4 rounded-lg py-3 transition-colors hover:bg-gray-100 w-full
              ${isNarrow ? "justify-center px-0" : "px-3"}
            `}
          >
            <Menu size={26} strokeWidth={1.8} className="shrink-0 text-gray-800" />
            {!isNarrow && <span className="text-sm">More</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-4 rounded-lg py-3 transition-colors hover:bg-red-50 text-red-500 w-full
              ${isNarrow ? "justify-center px-0" : "px-3"}
            `}
          >
            <LogOut size={26} strokeWidth={1.8} className="shrink-0" />
            {!isNarrow && <span className="text-sm">Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────── */}
      {/*
        Real Instagram bottom bar:
          - Pure white background
          - 0.5 px top border
          - 5 equally-spaced icons, each ~44px tap target
          - Active icon is full black / filled; inactive is outlined gray
          - Bottom padding = safe-area-inset-bottom (home indicator space)
      */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          bg-white border-t border-gray-200
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
                    className={isActive ? "text-black" : "text-gray-600"}
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
                  className={isActive ? "text-black" : "text-gray-600"}
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
