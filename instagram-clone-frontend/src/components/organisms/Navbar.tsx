import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotification";
import { useMyProfile } from "../../hooks/useProfile";
import { useSearchPosts, useSearchUsers } from "../../hooks/useSearch";
import Avatar from "../atoms/Avatar";
import PostDetailsModal from "./PostDetailsModal";

/**
 * Top bar — visible only on mobile/tablet (hidden on lg+ where the sidebar takes over).
 * Matches Instagram's mobile header: wordmark left, action icons right.
 */
const Navbar = () => {
  const navigate = useNavigate();

  const { data: notifData } = useNotifications();
  const { data: profileData } = useMyProfile();

  const unreadCount =
    notifData?.notifications?.filter((n: any) => !n.isRead).length ?? 0;

  // ── search ──────────────────────────────────────────────
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
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDropdown(false); };
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
    /* Only render on screens narrower than lg (1024 px) */
    <header className="sticky top-0 z-50 bg-white border-b lg:hidden">
      <div className="h-14 flex items-center justify-between px-4">

        {/* Wordmark */}
        <Link to="/" className="font-logo text-2xl leading-none pt-1 select-none">
          Instagram
        </Link>

        {/* Inline search — md only (hidden on small, hidden on lg+) */}
        <div ref={searchBoxRef} className="hidden md:flex lg:hidden w-56 relative mx-4">
          <form
            onSubmit={(e) => { e.preventDefault(); goToFullResults(); }}
            className="relative w-full"
          >
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search"
              className="w-full bg-gray-100 rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
            />
          </form>

          {showDropdown && debouncedQuery.length > 0 && (
            <div className="absolute top-11 left-0 w-full bg-white border rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
              {users.length === 0 && posts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
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
                      className="flex items-center gap-3 w-full px-4 py-2 hover:bg-gray-50 text-left"
                    >
                      <Avatar src={u.profilePicture} name={u.name} size={8} />
                      <div className="leading-tight min-w-0">
                        <div className="font-semibold text-sm truncate">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate">@{u.username}</div>
                      </div>
                    </button>
                  ))}
                  {posts.length > 0 && (
                    <div className="grid grid-cols-4 gap-1 px-2 pb-2">
                      {posts.map((p: any) => (
                        <button
                          key={p._id}
                          onClick={() => { setOpenPostId(p._id); setShowDropdown(false); }}
                          className="aspect-square overflow-hidden rounded"
                        >
                          {p.images?.[0]?.url && (
                            <img src={p.images[0].url} alt={p.caption} className="w-full h-full object-cover" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={goToFullResults}
                    className="w-full border-t px-4 py-3 text-sm text-blue-600 font-semibold hover:bg-gray-50"
                  >
                    See all results for "{debouncedQuery}"
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-4">
          {/* Messages */}
          <Link to="/messages" className="relative text-gray-800">
            <MessageCircle size={24} strokeWidth={1.8} />
          </Link>

          {/* Notifications */}
          <Link to="/notification" className="relative text-gray-800">
            <Heart size={24} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {openPostId && (
        <PostDetailsModal postId={openPostId} onClose={() => setOpenPostId(null)} />
      )}
    </header>
  );
};

export default Navbar;
