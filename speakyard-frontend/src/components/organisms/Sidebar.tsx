import { Home, Phone, MessageCircle, LogOut, Settings } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMyProfile } from "../../hooks/useProfile";
import api from "../../api/axios";
import Avatar from "../atoms/Avatar";
import Logo from "../atoms/Logo";
import { useToast } from "../ui/Toast";

// Home (Practice), Calls, Messages, Profile — the whole MVP nav.
const NAV_ITEMS = [
  { name: "Home", icon: Home, path: "/" },
  { name: "Calls", icon: Phone, path: "/calls" },
  { name: "Messages", icon: MessageCircle, path: "/messages" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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

  const { data: profileData } = useMyProfile();
  const profilePicture = profileData?.user?.profilePicture;
  const name = profileData?.user?.name;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — redirect regardless
    }
    queryClient.clear();
    showToast("Signed out", "info");
    navigate("/login");
  };

  const isActivePath = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const linkClass = (active: boolean) => `
    flex items-center gap-4 rounded-xl px-3 min-h-[48px] transition-colors
    hover:bg-gray-100 dark:hover:bg-neutral-900
    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
    ${active ? "font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-neutral-900" : "font-medium text-gray-700 dark:text-neutral-300"}
  `;

  return (
    <>
      {/* ── Desktop sidebar (768px and up) — always full width ── */}
      <aside
        className="
          hidden md:flex fixed left-0 top-0 h-screen w-[245px] px-4 py-5
          border-r border-gray-200 dark:border-neutral-800
          bg-white dark:bg-black flex-col justify-between z-40
        "
      >
        <div className="flex flex-col gap-1">
          <NavLink
            to="/"
            className="mb-6 flex items-center h-12 px-1 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Speakyard home"
          >
            <Logo size={32} />
          </NavLink>

          {NAV_ITEMS.map(({ name: itemName, icon: Icon, path }) => {
            const active = isActivePath(path);

            return (
              <NavLink key={itemName} to={path} className={linkClass(active)}>
                <Icon
                  size={24}
                  strokeWidth={active ? 2.3 : 1.9}
                  className={active ? "text-brand-600 dark:text-brand-400" : ""}
                />
                <span className="text-sm">{itemName}</span>
              </NavLink>
            );
          })}

          {/* Profile */}
          <NavLink to="/profile" className={linkClass(isActivePath("/profile"))}>
            <Avatar
              src={profilePicture}
              name={name}
              size={6}
              className={
                isActivePath("/profile")
                  ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-black"
                  : ""
              }
            />
            <span className="text-sm">Profile</span>
          </NavLink>
        </div>

        {/* Bottom: settings + logout */}
        <div className="flex flex-col gap-1 relative" ref={moreMenuRef}>
          {showMoreMenu && (
            <div
              className="
                absolute bottom-[56px] left-0 w-full
                bg-white dark:bg-neutral-900
                border border-gray-200 dark:border-neutral-700
                rounded-xl shadow-lg z-50 py-2
              "
            >
              <button
                onClick={() => {
                  navigate("/settings");
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 min-h-[44px] text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 transition"
              >
                <Settings size={18} strokeWidth={1.9} />
                Settings
              </button>
              <div className="border-t border-gray-100 dark:border-neutral-700 my-1" />
              <button
                onClick={() => {
                  handleLogout();
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 min-h-[44px] text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
              >
                <LogOut size={18} strokeWidth={1.9} />
                Log out
              </button>
            </div>
          )}

          <button
            onClick={() => setShowMoreMenu((v) => !v)}
            aria-expanded={showMoreMenu}
            className={`
              flex items-center gap-4 rounded-xl px-3 min-h-[48px] w-full transition-colors
              hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-700 dark:text-neutral-300
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
              ${showMoreMenu ? "bg-gray-100 dark:bg-neutral-900 font-semibold" : "font-medium"}
            `}
          >
            <Settings size={24} strokeWidth={1.9} className="shrink-0" />
            <span className="text-sm">More</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar (below 768px) ────────────── */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-50 md:hidden
          bg-white dark:bg-black
          border-t border-gray-200 dark:border-neutral-800
          flex justify-around items-stretch
          pl-safe pr-safe
        "
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          minHeight: 56,
        }}
        aria-label="Main"
      >
        {NAV_ITEMS.map(({ name: itemName, icon: Icon, path }) => {
          const active = isActivePath(path);

          return (
            <NavLink
              key={itemName}
              to={path}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
              aria-label={itemName}
            >
              <Icon
                size={23}
                strokeWidth={active ? 2.3 : 1.9}
                className={
                  active ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-neutral-400"
                }
              />
              <span
                className={`text-[10px] leading-none ${
                  active
                    ? "font-bold text-brand-600 dark:text-brand-400"
                    : "font-medium text-gray-500 dark:text-neutral-400"
                }`}
              >
                {itemName}
              </span>
            </NavLink>
          );
        })}

        {/* Profile tab */}
        <NavLink
          to="/profile"
          className="relative flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset"
          aria-label="Profile"
        >
          <Avatar
            src={profilePicture}
            name={name}
            size={6}
            className={
              isActivePath("/profile")
                ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-black"
                : ""
            }
          />
          <span
            className={`text-[10px] leading-none ${
              isActivePath("/profile")
                ? "font-bold text-brand-600 dark:text-brand-400"
                : "font-medium text-gray-500 dark:text-neutral-400"
            }`}
          >
            Profile
          </span>
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
