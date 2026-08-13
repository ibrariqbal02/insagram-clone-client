import { useState } from "react";
import { Lock, Copy } from "lucide-react";
import { useUserPosts } from "../../hooks/useProfile";
import { useMyProfile, useUserProfile } from "../../hooks/useProfile";
import ImageCarousel from "../atoms/ImageCarousel";
import PostDetailsModal from "./PostDetailsModal";

type Props = {
  userId: string;
};

const ProfilePosts = ({ userId }: Props) => {
  const { data, isLoading } = useUserPosts(userId);
  const { data: profileData } = useUserProfile(userId);
  const { data: myProfile } = useMyProfile();
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10 text-gray-500">
        Loading posts...
      </div>
    );
  }

  const user = profileData?.user;
  const isMe = myProfile?.user?._id === user?._id;
  const isLocked = data?.isPrivate === true && !isMe;

  if (isLocked) {
    return (
      <div className="rounded-xl bg-white py-16 text-center shadow">
        <div className="flex justify-center mb-4">
          <Lock size={48} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold">This account is private</h2>
        <p className="mt-2 text-gray-500">
          Follow this account to see their photos and videos.
        </p>
      </div>
    );
  }

  const posts = data?.posts || [];

  if (posts.length === 0) {
    return (
      <div className="rounded-xl bg-white py-16 text-center shadow">
        <h2 className="text-2xl font-semibold">No Posts Yet</h2>
        <p className="mt-2 text-gray-500">
          This user hasn't shared any posts.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Instagram-style 3-column grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post: any) => (
          <div
            key={post._id}
            className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
          >
            {/* Carousel inside the tile — arrows hidden by default, appear on hover */}
            <div className="w-full h-full" onClick={() => setOpenPostId(post._id)}>
              <ImageCarousel
                images={post.images}
                alt={post.caption}
                heightClass="h-full"
                fit="cover"
                bgClass="bg-gray-100"
              />
            </div>

            {/* Multi-image badge (top-right) — like Instagram's stacked squares */}
            {post.images?.length > 1 && (
              <div className="absolute top-2 right-2 pointer-events-none">
                <Copy size={18} className="text-white drop-shadow" />
              </div>
            )}

            {/* Hover overlay with likes / comments */}
            <div
              className="
                absolute inset-0 flex items-center justify-center
                bg-black/40 opacity-0 group-hover:opacity-100
                transition pointer-events-none
              "
            >
              <div className="flex gap-6 text-white font-semibold text-sm">
                <span>♥ {post.likes?.length ?? 0}</span>
                <span>💬 {post.comments?.length ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {openPostId && (
        <PostDetailsModal
          postId={openPostId}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </>
  );
};

export default ProfilePosts;
