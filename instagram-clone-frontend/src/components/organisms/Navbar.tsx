import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotification";
import { useMyProfile } from "../../hooks/useProfile";
import { useSearchPosts, useSearchUsers } from "../../hooks/useSearch";
import Avatar from "../atoms/Avatar";
import PostDetailsModal from "./PostDetailsModal";

/**
 * Mobile/tablet top bar — hidden on lg+ where the sidebar takes over.
 * Matches real Instagram mobile header exactly:
 *   - White background, hairline bottom border
 *   - "Instagram" wordmark (cursive) on the left
 *   - Message + notification icons on the right
 *   - 44 px tall (standard iOS tap target)
 */
const Navbar = () => {
  const navigate = useNavigate();

  const { data: notifData } = useNotifications();
  useMyProfile();

  const unreadCount =
    notifData?.notifications?.filter((n: any) => !n.isRead).length ?? 0;

  // ── inline search (md tablets only) ─────────────────────
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: usersData } = useSearchUsers(debouncedQuery);
  const { data: postsData } = useSearchPosts(debouncedQuery);
  const users = (usersData?.users || []).slice(0, 5);
  const posts = (postsData?.posts || []).slice(0, 4);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const goToFullResults = () => {
    if (!query.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(query.trim())}`);
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-800 lg:hidden pt-safe">
      <div className="h-11 flex items-center justify-between px-4">

        {/* Wordmark */}
        <Link
          to="/"
          className="font-logo text-[28px] leading-none select-none text-gray-900 dark:text-white"
          style={{ paddingTop: 2 }}
        >
          Instagram
        </Link>

        {/* Inline search — md tablets only */}
        <div
          ref={searchBoxRef}
          className="hidden md:flex lg:hidden w-52 relative mx-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToFullResults();
            }}
            className="relative w-full"
          >
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search"
              className="w-full bg-gray-100 dark:bg-neutral-800 rounded-lg py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-neutral-400"
              style={{ fontSize: 16 }}
            />
          </form>

          {showDropdown && debouncedQuery.length > 0 && (
            <div className="absolute top-10 left-0 w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl shadow-lg max-h-80 overflow-y-auto z-50">
              {users.length === 0 && posts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-neutral-400 text-sm">
                  No results for "{debouncedQuery}"
                </div>
              ) : (
                <>
                  {users.map((u: any) => (
                    <button
                      key={u._id}
                      onClick={() => {
                        navigate(`/profile/${u._id}`);
                        setShowDropdown(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 text-left"
                    >
                      <Avatar src={u.profilePicture} name={u.name} size={8} />
                      <div className="leading-tight min-w-0">
                        <div className="font-semibold text-sm truncate dark:text-white">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          @{u.username}
                        </div>
                      </div>
                    </button>
                  ))}
                  {posts.length > 0 && (
                    <div className="grid grid-cols-4 gap-0.5 px-2 pb-2">
                      {posts.map((p: any) => (
                        <button
                          key={p._id}
                          onClick={() => {
                            setOpenPostId(p._id);
                            setShowDropdown(false);
                          }}
                          className="aspect-square overflow-hidden rounded"
                        >
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt={p.caption}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={goToFullResults}
                    className="w-full border-t border-gray-100 dark:border-neutral-700 px-4 py-3 text-sm text-[#0095f6] font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    See all results for "{debouncedQuery}"
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1">
          {/* Notifications — heart */}
          <Link
            to="/notification"
            className="relative flex items-center justify-center w-10 h-10 text-gray-900 dark:text-white"
            aria-label="Notifications"
          >
            <Heart size={24} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Messages — paper plane */}
          <Link
            to="/messages"
            className="relative flex items-center justify-center w-10 h-10 text-gray-900 dark:text-white"
            aria-label="Messages"
          >
            <MessageCircle size={24} strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      {openPostId && (
        <PostDetailsModal
          postId={openPostId}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </header>
  );
};

export default Navbar;
