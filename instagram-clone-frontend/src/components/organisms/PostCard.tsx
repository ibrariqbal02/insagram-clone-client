import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";

import Avatar from "../atoms/Avatar";
import ImageCarousel from "../atoms/ImageCarousel";
import PostDetailsModal from "./PostDetailsModal";
import PostOptionsMenu from "./PostOptionsMenu";
import NewConversationModal from "./NewConversationModal";
import { useLikeUnlikePost } from "../../hooks/usePost";
import { useMe } from "../../hooks/useAuth";

type Image = {
  url: string;
  publicId: string;
};

type Owner = {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
};

type Post = {
  _id: string;
  caption: string;
  images: Image[];
  likes: string[];
  owner: Owner;
  status: "active" | "archived";
  createdAt?: string;
};

type Props = {
  post: Post;
};

const PostCard = ({ post }: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: me } = useMe();
  const myId = me?.user?._id;

  const isOwner = post.owner._id === myId;

  const likeMutation = useLikeUnlikePost();

  const isLiked = useMemo(() => {
    if (!myId) return false;
    return post.likes.some((id) => id === myId);
  }, [myId, post.likes]);

  const handleLike = () => {
    likeMutation.mutate(post._id);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow border mb-8 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4">

          <Link
            to={`/profile/${post.owner._id}`}
            className="flex items-center gap-3"
          >
            <Avatar
              src={post.owner.profilePicture}
              name={post.owner.name}
              size={11}
            />

            <div>
              <h2 className="font-semibold hover:underline">
                {post.owner.name}
              </h2>

              <p className="text-sm text-gray-500">
                @{post.owner.username}
              </p>
            </div>
          </Link>

          {/* 3-dot: owner gets options dropdown, others open the detail modal */}
          {isOwner ? (
            <PostOptionsMenu
              post={post}
              onPostRemoved={() => setShowDetails(false)}
            />
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
              title="View post"
            >
              <MoreHorizontal size={22} />
            </button>
          )}

        </div>

        {/* Images — carousel when more than one */}
        {post.images.length > 0 && (
          <ImageCarousel
            images={post.images}
            alt={post.caption || "Post"}
            heightClass="h-[500px]"
            fit="cover"
            bgClass="bg-gray-100"
            onClick={() => setShowDetails(true)}
          />
        )}

        {/* Footer */}
        <div className="p-4">

          {/* Actions */}
          <div className="flex items-center justify-between mb-4">

            <div className="flex gap-5">

              {/* Like */}
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="hover:scale-110 transition disabled:opacity-50"
                title="Like"
              >
                <Heart
                  size={24}
                  className={
                    isLiked
                      ? "text-red-500"
                      : ""
                  }
                  fill={
                    isLiked
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>

              {/* Comments */}
              <button
                onClick={() => setShowDetails(true)}
                className="hover:scale-110 transition"
                title="Comments"
              >
                <MessageCircle size={24} />
              </button>

              {/* Send / Share */}
              <button
                onClick={() => setShowShareModal(true)}
                className="hover:scale-110 transition"
                title="Share via message"
              >
                <Send size={22} />
              </button>

            </div>
          </div>

          {/* Likes */}
          <p className="font-semibold">
            {post.likes.length} Likes
          </p>

          {/* Caption */}
          <p className="mt-2">
            <Link
              to={`/profile/${post.owner._id}`}
              className="font-semibold mr-2 hover:underline"
            >
              {post.owner.username}
            </Link>

            {post.caption}
          </p>

          {/* Comments */}
          <button
            onClick={() => setShowDetails(true)}
            className="text-gray-500 mt-3 hover:text-black"
          >
            View Comments
          </button>

          {/* Time */}
          <p className="text-xs text-gray-400 mt-3">
            {post.createdAt
              ? new Date(
                post.createdAt
              ).toLocaleDateString()
              : ""}
          </p>

        </div>
      </div>

      {/* Post Details */}
      {showDetails && (
        <PostDetailsModal
          postId={post._id}
          onClose={() => setShowDetails(false)}
        />
      )}

      {/* Share via message */}
      {showShareModal && (
        <NewConversationModal
          onClose={() => setShowShareModal(false)}
          initialMessage={`Check out this post: ${window.location.origin}/profile/${post.owner._id}`}
        />
      )}
    </>
  );
};

export default PostCard;