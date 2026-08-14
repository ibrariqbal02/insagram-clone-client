import { Link } from "react-router-dom";
import PostCard from "../../components/organisms/PostCard";
import { useFeed } from "../../hooks/useFeed";

const Home = () => {
  const { data, isLoading } = useFeed();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border-b border-gray-200 animate-pulse">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-100 rounded w-16" />
              </div>
            </div>
            <div className="w-full aspect-square bg-gray-100" />
            <div className="px-3 py-2.5 space-y-2">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-200" />
                <div className="w-7 h-7 rounded-full bg-gray-200" />
                <div className="w-7 h-7 rounded-full bg-gray-200" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-100 rounded w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No posts at all — new user with no public posts available yet
  if (!data?.posts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="text-5xl mb-4">📸</div>
        <h2 className="text-lg font-semibold mb-1">Welcome to Instagram</h2>
        <p className="text-gray-500 text-sm mb-4">
          Follow people to see their photos and videos here.
        </p>
        <Link
          to="/search"
          className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-lg px-5 py-2 transition"
        >
          Find people to follow
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Explore banner — shown only when the feed is a public-posts fallback */}
      {data.isExplore && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Suggested for you</p>
            <p className="text-xs text-gray-500">
              Follow people to personalise your feed.
            </p>
          </div>
          <Link
            to="/search"
            className="shrink-0 text-[#0095f6] font-semibold text-sm hover:underline"
          >
            Find people
          </Link>
        </div>
      )}

      {data.posts.map((post: any) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Home;
