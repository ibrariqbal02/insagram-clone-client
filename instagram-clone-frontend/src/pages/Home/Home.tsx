import PostCard from "../../components/organisms/PostCard";
import { useFeed } from "../../hooks/useFeed";

const Home = () => {
  const { data, isLoading } = useFeed();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-0">
        {/* Skeleton shimmer cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border-b border-gray-200 animate-pulse">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-28" />
                <div className="h-2.5 bg-gray-100 rounded w-16" />
              </div>
            </div>
            {/* Image */}
            <div className="w-full aspect-square bg-gray-100" />
            {/* Actions */}
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

  if (!data?.posts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="text-5xl mb-4">📸</div>
        <h2 className="text-lg font-semibold mb-1">Your feed is empty</h2>
        <p className="text-gray-500 text-sm">
          Follow people to see their photos here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {data.posts.map((post: any) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Home;
