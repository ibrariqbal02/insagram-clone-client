import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArchiveRestore, Copy } from "lucide-react";

import { useArchivedPosts, useUnarchivePost } from "../../hooks/usePost";
import ImageCarousel from "../../components/atoms/ImageCarousel";
import PostDetailsModal from "../../components/organisms/PostDetailsModal";

const Archive = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useArchivedPosts();
  const unarchive = useUnarchivePost();
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const posts = data?.posts || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Back to profile"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold">Archive</h1>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex justify-center py-20 text-gray-500">
          Loading archived posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow">
          <h2 className="text-2xl font-semibold">No Archived Posts</h2>
          <p className="mt-2 text-gray-500">
            Posts you archive will appear here.
          </p>
        </div>
      ) : (
        /* Instagram-style 3-column square grid */
        <div className="grid grid-cols-3 gap-0.5">
          {posts.map((post: any) => (
            <div
              key={post._id}
              className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
            >
              {/* Carousel thumbnail */}
              <div
                className="w-full h-full"
                onClick={() => setOpenPostId(post._id)}
              >
                <ImageCarousel
                  images={post.images}
                  alt={post.caption}
                  heightClass="h-full"
                  fit="cover"
                  bgClass="bg-gray-100"
                />
              </div>

              {/* Multi-image badge */}
              {post.images?.length > 1 && (
                <div className="absolute top-2 right-2 pointer-events-none">
                  <Copy size={18} className="text-white drop-shadow" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition gap-4 pointer-events-none group-hover:pointer-events-auto">
                <div className="flex gap-6 text-white font-semibold text-sm">
                  <span>♥ {post.likes?.length ?? 0}</span>
                  <span>💬 {post.comments?.length ?? 0}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    unarchive.mutate(post._id);
                  }}
                  disabled={unarchive.isPending}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 transition"
                >
                  <ArchiveRestore size={16} />
                  Unarchive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openPostId && (
        <PostDetailsModal
          postId={openPostId}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </div>
  );
};

export default Archive;
