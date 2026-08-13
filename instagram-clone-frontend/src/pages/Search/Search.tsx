import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";

import PostDetailsModal from "../../components/organisms/PostDetailsModal";
import { useSearchPosts, useSearchUsers } from "../../hooks/useSearch";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get("keyword") || "";

  const [keyword, setKeyword] = useState(initialKeyword);
  const queryKeyword = useMemo(() => keyword.trim(), [keyword]);

  const { data: usersData, isLoading: usersLoading } = useSearchUsers(queryKeyword);
  const { data: postsData, isLoading: postsLoading } = useSearchPosts(queryKeyword);

  const users = usersData?.users || [];
  const posts = postsData?.posts || [];

  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(queryKeyword ? { keyword: queryKeyword } : {});
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Search</h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search posts or users..."
              className="w-full bg-white border rounded-lg py-2 pl-10 pr-3 outline-none"
            />
          </div>
          <button className="bg-blue-600 text-white px-5 rounded-lg">Search</button>
        </form>

        {queryKeyword.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            Type something to search.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Users</h2>
              {usersLoading ? (
                <div>Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-gray-500">No users found.</div>
              ) : (
                <div className="bg-white rounded-xl shadow divide-y">
                  {users.map((u: any) => (
                    <Link
                      key={u._id}
                      to={`/profile/${u._id}`}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50"
                    >
                      <img
                        src={u.profilePicture}
                        alt={u.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <div className="leading-tight">
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-sm text-gray-500">@{u.username}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Posts</h2>
              {postsLoading ? (
                <div>Loading...</div>
              ) : posts.length === 0 ? (
                <div className="text-gray-500">No posts found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((p: any) => (
                    <button
                      key={p._id}
                      onClick={() => setOpenPostId(p._id)}
                      className="overflow-hidden rounded-xl bg-white shadow border text-left"
                    >
                      {p.images?.[0]?.url && (
                        <img
                          src={p.images[0].url}
                          alt={p.caption}
                          className="w-full h-64 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="font-semibold truncate">{p.caption || "Untitled"}</div>
                        <div className="text-sm text-gray-500">
                          {p.owner?.username ? `@${p.owner.username}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
