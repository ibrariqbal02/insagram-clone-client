import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";

import PostDetailsModal from "../../components/organisms/PostDetailsModal";
import { useSearchPosts, useSearchUsers } from "../../hooks/useSearch";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const [focused, setFocused]   = useState(false);
  const queryKeyword = useMemo(() => keyword.trim(), [keyword]);

  const { data: usersData, isLoading: usersLoading } = useSearchUsers(queryKeyword);
  const { data: postsData, isLoading: postsLoading }  = useSearchPosts(queryKeyword);

  const users = usersData?.users || [];
  const posts = postsData?.posts || [];

  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(queryKeyword ? { keyword: queryKeyword } : {});
    (document.activeElement as HTMLElement)?.blur();
  };

  const clearSearch = () => {
    setKeyword("");
    setSearchParams({});
  };

  const isLoading = usersLoading || postsLoading;
  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <>
      {/*
        Instagram Explore on mobile:
          - Sticky search bar at top (no page title)
          - While focused + no query: show recent searches (we skip that, show hint)
          - Results: users list first, then tight 3-column photo grid
      */}
      <div className="flex flex-col min-h-full bg-white">

        {/* ── Search bar ─────────────────────────────── */}
        <div className="px-3 py-2 bg-white border-b border-gray-100 sticky top-0 z-10">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <SearchIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search"
                className="
                  w-full bg-gray-100 rounded-xl
                  py-2 pl-9 pr-9
                  text-sm text-gray-900 placeholder:text-gray-400
                  outline-none focus:bg-gray-100
                "
              />
              {keyword.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {(focused || keyword.length > 0) && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearSearch}
                className="text-sm text-gray-800 font-medium shrink-0"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* ── Body ───────────────────────────────────── */}
        {queryKeyword.length === 0 ? (
          /* Empty state — Explore grid placeholder */
          <div className="flex flex-col items-center justify-center flex-1 text-center px-8 py-20">
            <SearchIcon size={48} strokeWidth={1} className="text-gray-300 mb-4" />
            <p className="text-base font-semibold text-gray-800 mb-1">Search</p>
            <p className="text-sm text-gray-400">
              Search for people and posts
            </p>
          </div>
        ) : isLoading ? (
          /* Skeleton */
          <div className="px-3 py-3 space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-2.5 bg-gray-100 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasResults ? (
          <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
            <p className="font-semibold text-gray-800 mb-1">No results found</p>
            <p className="text-sm text-gray-400">
              No accounts or posts found for "{queryKeyword}"
            </p>
          </div>
        ) : (
          <div>
            {/* ── People ── */}
            {users.length > 0 && (
              <div>
                <p className="px-4 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
                  Accounts
                </p>
                {users.map((u: any) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u._id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition"
                  >
                    {u.profilePicture ? (
                      <img
                        src={u.profilePicture}
                        alt={u.name}
                        className="w-11 h-11 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold shrink-0">
                        {u.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">
                        {u.username}
                      </p>
                      <p className="text-xs text-gray-400 leading-tight truncate">
                        {u.name}
                        {u.followers?.length
                          ? ` · ${u.followers.length} followers`
                          : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* ── Posts grid — 3 columns, no gaps (Instagram Explore style) ── */}
            {posts.length > 0 && (
              <div>
                <p className="px-4 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
                  Posts
                </p>
                <div className="grid grid-cols-3 gap-px bg-gray-200">
                  {posts.map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => setOpenPostId(p._id)}
                      className="relative aspect-square overflow-hidden bg-gray-100 group"
                    >
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.caption || "Post"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                      {/* Multi-image indicator */}
                      {p.images?.length > 1 && (
                        <div className="absolute top-1.5 right-1.5 pointer-events-none">
                          <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4 drop-shadow">
                            <rect x="6" y="2" width="12" height="12" rx="2" opacity="0.9" />
                            <rect x="2" y="6" width="12" height="12" rx="2" />
                          </svg>
                        </div>
                      )}
                      {/* Hover overlay — desktop only */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition hidden lg:flex items-center justify-center gap-4 text-white font-semibold text-sm pointer-events-none">
                        <span>♥ {p.likes?.length ?? 0}</span>
                        <span>💬 {p.comments?.length ?? 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {openPostId && (
        <PostDetailsModal postId={openPostId} onClose={() => setOpenPostId(null)} />
      )}
    </>
  );
};

export default Search;
