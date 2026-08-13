import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MoreHorizontal, Send, Bookmark } from "lucide-react";

import Avatar from "../atoms/Avatar";
import ImageCarousel from "../atoms/ImageCarousel";
import PostDetailsModal from "./PostDetailsModal";
import PostOptionsMenu from "./PostOptionsMenu";
import NewConversationModal from "./NewConversationModal";
import { useLikeUnlikePost } from "../../hooks/usePost";
import { useMe } from "../../hooks/useAuth";

type Image = { url: string; publicId: string };
type Owner = { _id: string; name: string; username: string; profilePicture: string };
type Post  = {
  _id: string;
  caption: string;
  images: Image[];
  likes: string[];
  owner: Owner;
  status: "active" | "archived";
  createdAt?: string;
};

type Props = { post: Post };

/** Format "2 hours ago" style relative time */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(diff / 604_800_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days  < 7)  return `${days}d`;
  if (weeks < 52) return `${weeks}w`;
  return new Date(dateStr).toLocaleDateString();
}

const PostCard = ({ post }: Props) => {
  const [showDetails,    setShowDetails]    = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: me } = useMe();
  const myId   = me?.user?._id;
  const isOwner = post.owner._id === myId;

  const likeMutation = useLikeUnlikePost();
  const isLiked = useMemo(
    () => (myId ? post.likes.some((id) => id === myId) : false),
    [myId, post.likes]
  );

  const handleLike = () => likeMutation.mutate(post._id);

  return (
    <>
      {/*
        Mobile: no card chrome — flat, full-width, white, hairline divider at bottom.
        Desktop: card with rounded corners + shadow.
      */}
      <article className="bg-white border-b border-gray-200 lg:rounded-xl lg:border lg:shadow lg:mb-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <Link
            to={`/profile/${post.owner._id}`}
            className="flex items-center gap-2.5 min-w-0"
          >
            {/* Avatar with story-ring placeholder gradient */}
            <div className="story-ring shrink-0">
              <div className="story-ring-inner">
                <Avatar
                  src={post.owner.profilePicture}
                  name={post.owner.name}
                  size={9}
                />
              </div>
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {post.owner.username}
              </p>
              {post.createdAt && (
                <p className="text-[11px] text-gray-400 leading-tight">
                  {relativeTime(post.createdAt)}
                </p>
              )}
            </div>
          </Link>

          {/* Options */}
          {isOwner ? (
            <PostOptionsMenu
              post={post}
              onPostRemoved={() => setShowDetails(false)}
            />
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center justify-center w-9 h-9 -mr-1 text-gray-700"
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </button>
          )}
        </div>

        {/* ── Image ──────────────────────────────────────── */}
        {post.images.length > 0 && (
          <div className="w-full">
            <ImageCarousel
              images={post.images}
              alt={post.caption || "Post"}
              /*
               * Mobile: square (aspect-ratio via CSS).
               * We pass a generous fixed height — the carousel clips it.
               * On desktop the card constrains width so square looks great.
               */
              heightClass="aspect-square h-auto max-h-[600px]"
              fit="cover"
              bgClass="bg-black"
              onClick={() => setShowDetails(true)}
            />
          </div>
        )}

        {/* ── Actions ────────────────────────────────────── */}
        <div className="px-3 pt-2.5 pb-1">
          <div className="flex items-center justify-between">
            {/* Left: like, comment, share */}
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="flex items-center justify-center w-9 h-9 -ml-1.5 disabled:opacity-50"
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart
                  size={26}
                  strokeWidth={1.8}
                  className={isLiked ? "text-red-500" : "text-gray-900"}
                  fill={isLiked ? "currentColor" : "none"}
                  style={{
                    transition: "transform 0.1s ease",
                    transform: likeMutation.isPending ? "scale(0.85)" : "scale(1)",
                  }}
                />
              </button>

              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center justify-center w-9 h-9"
                aria-label="Comment"
              >
                <MessageCircle size={26} strokeWidth={1.8} className="text-gray-900" />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center justify-center w-9 h-9"
                aria-label="Share"
              >
                {/* Instagram uses a paper-plane (send) icon */}
                <Send size={24} strokeWidth={1.8} className="text-gray-900" />
              </button>
            </div>

            {/* Right: bookmark */}
            <button
              className="flex items-center justify-center w-9 h-9 -mr-1.5"
              aria-label="Save"
            >
              <Bookmark size={24} strokeWidth={1.8} className="text-gray-900" />
            </button>
          </div>

          {/* Likes count */}
          {post.likes.length > 0 && (
            <p className="font-semibold text-sm mt-1">
              {post.likes.length.toLocaleString()}{" "}
              {post.likes.length === 1 ? "like" : "likes"}
            </p>
          )}

          {/* Caption */}
          {post.caption ? (
            <p className="text-sm mt-1 leading-snug">
              <Link
                to={`/profile/${post.owner._id}`}
                className="font-semibold mr-1 hover:underline"
              >
                {post.owner.username}
              </Link>
              {post.caption}
            </p>
          ) : null}

          {/* View comments link */}
          <button
            onClick={() => setShowDetails(true)}
            className="text-gray-400 text-sm mt-1"
          >
            View all comments
          </button>

          {/* Timestamp */}
          {post.createdAt && (
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mt-1 mb-1">
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </article>

      {showDetails && (
        <PostDetailsModal
          postId={post._id}
          onClose={() => setShowDetails(false)}
        />
      )}

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
