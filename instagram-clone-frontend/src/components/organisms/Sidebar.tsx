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
      // ignore, redirect regardless
    }
    navigate("/login");
  };

  // On the messages page the sidebar collapses to icon-only automatically
  // so the chat has more space
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

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        className={`
          hidden lg:flex fixed left-0 top-0 h-screen border-r bg-white
          flex-col justify-between z-40 transition-all duration-200
          ${isNarrow ? "w-[72px] px-3 py-5" : "w-[245px] px-4 py-5"}
        `}
      >
        <div className="flex flex-col gap-1">

          {/* Wordmark / icon logo */}
          <div
            className={`
              mb-6 flex items-center
              ${isNarrow ? "justify-center h-12" : "h-12 px-2"}
            `}
          >
            {isNarrow ? (
              /* Camera-style Instagram icon when narrow */
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
            const isActive = path === "/"
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
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
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
              flex items-center gap-4 rounded-lg py-3 transition-colors
              hover:bg-gray-100
              ${isNarrow ? "justify-center px-0" : "px-3"}
              ${location.pathname.startsWith("/profile") ? "font-semibold" : "font-normal"}
            `}
          >
            <span className="shrink-0">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="profile"
                  className={`rounded-full object-cover border-2 ${
                    location.pathname.startsWith("/profile")
                      ? "border-black"
                      : "border-transparent"
                  } w-7 h-7`}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-transparent">
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
              flex items-center gap-4 rounded-lg py-3 transition-colors
              hover:bg-gray-100 w-full
              ${isNarrow ? "justify-center px-0" : "px-3"}
            `}
          >
            <Menu size={26} strokeWidth={1.8} className="shrink-0 text-gray-800" />
            {!isNarrow && <span className="text-sm">More</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-4 rounded-lg py-3 transition-colors
              hover:bg-red-50 text-red-500 w-full
              ${isNarrow ? "justify-center px-0" : "px-3"}
            `}
          >
            <LogOut size={26} strokeWidth={1.8} className="shrink-0" />
            {!isNarrow && <span className="text-sm">Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t flex justify-around items-center py-2 z-50">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `p-2 ${isActive ? "text-black" : "text-gray-600"}`
          }
        >
          <Home size={26} strokeWidth={location.pathname === "/" ? 2.2 : 1.8} />
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `p-2 ${isActive ? "text-black" : "text-gray-600"}`
          }
        >
          <Search size={26} strokeWidth={location.pathname.startsWith("/search") ? 2.2 : 1.8} />
        </NavLink>

        <NavLink
          to="/create-post"
          className={({ isActive }) =>
            `p-2 ${isActive ? "text-black" : "text-gray-600"}`
          }
        >
          <PlusSquare size={26} strokeWidth={1.8} />
        </NavLink>

        <NavLink
          to="/notification"
          className="p-2 relative text-gray-600"
        >
          <Heart
            size={26}
            strokeWidth={location.pathname.startsWith("/notification") ? 2.2 : 1.8}
            className={location.pathname.startsWith("/notification") ? "text-black" : ""}
          />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className="p-2"
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="profile"
              className={`w-7 h-7 rounded-full object-cover border-2 ${
                location.pathname.startsWith("/profile") ? "border-black" : "border-transparent"
              }`}
            />
          ) : (
            <User
              size={26}
              strokeWidth={location.pathname.startsWith("/profile") ? 2.2 : 1.8}
              className={location.pathname.startsWith("/profile") ? "text-black" : "text-gray-600"}
            />
          )}
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
