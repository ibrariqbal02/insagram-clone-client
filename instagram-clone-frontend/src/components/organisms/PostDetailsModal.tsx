import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Trash2,
  Pencil,
  X,
  Archive,
  ArchiveRestore,
} from "lucide-react";

import { useMe } from "../../hooks/useAuth";
import {
  useArchivePost,
  useDeletePost,
  useLikeUnlikePost,
  usePostById,
  useUnarchivePost,
} from "../../hooks/usePost";

import Avatar from "../atoms/Avatar";
import ImageCarousel from "../atoms/ImageCarousel";
import CommentList from "./CommentList";
import EditPostModal from "./EditPostModal";

type Props = {
  postId: string;
  onClose: () => void;
};

const PostDetailsModal = ({ postId, onClose }: Props) => {
  const { data: me } = useMe();
  const myId = me?.user?._id;

  const [openEditPost, setOpenEditPost] = useState(false);

  const { data: postData, isLoading } = usePostById(postId);
  const post = postData?.post;

  const likePost = useLikeUnlikePost();
  const deletePost = useDeletePost();

  const archivePostMutation = useArchivePost();
  const unarchivePostMutation = useUnarchivePost();

  const isOwner = post?.owner?._id === myId;

  const isArchived = post?.status === "archived";

  const isPostLiked = useMemo(() => {
    if (!myId) return false;

    return (post?.likes || []).some(
      (id: string) => id === myId
    );
  }, [myId, post?.likes]);

  // =========================
  // DELETE
  // =========================

  const handleDeletePost = () => {
    const ok = window.confirm("Delete this post?");

    if (!ok) return;

    deletePost.mutate(postId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // =========================
  // ARCHIVE
  // =========================

  const handleArchivePost = () => {
    const ok = window.confirm(
      "Are you sure you want to archive this post?"
    );

    if (!ok) return;

    archivePostMutation.mutate(postId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // =========================
  // UNARCHIVE
  // =========================

  const handleUnarchivePost = () => {
    const ok = window.confirm(
      "Are you sure you want to unarchive this post?"
    );

    if (!ok) return;

    unarchivePostMutation.mutate(postId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <>
      {/*
        Mobile:  fullscreen sheet (inset-0, no border-radius, no padding)
        Desktop: centered card with rounded corners and 85vh max height
      */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:bg-black/50 md:px-4">
        <div className="bg-white w-full md:rounded-xl md:max-w-4xl md:max-h-[85vh] h-full md:h-auto overflow-hidden flex flex-col">

          {/* ================= HEADER ================= */}

          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">

            {/* Owner */}

            <Link
              to={
                post?.owner?._id
                  ? `/profile/${post.owner._id}`
                  : "#"
              }
              onClick={onClose}
              className="flex items-center gap-3"
            >
              <Avatar
                src={post?.owner?.profilePicture}
                name={post?.owner?.name}
                size={9}
              />

              <div className="leading-tight">
                <div className="font-semibold hover:underline">
                  {post?.owner?.name}
                </div>

                <div className="text-xs text-gray-500">
                  @{post?.owner?.username}
                </div>
              </div>
            </Link>

            {/* ================= OWNER ACTIONS ================= */}

            <div className="flex items-center gap-2">

              {isOwner && (
                <>
                  {/* ARCHIVE / UNARCHIVE */}

                  {isArchived ? (
                    <button
                      onClick={handleUnarchivePost}
                      disabled={unarchivePostMutation.isPending}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      title="Unarchive post"
                    >
                      <ArchiveRestore size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={handleArchivePost}
                      disabled={archivePostMutation.isPending}
                      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                      title="Archive post"
                    >
                      <Archive size={18} />
                    </button>
                  )}

                  {/* EDIT */}

                  <button
                    onClick={() => setOpenEditPost(true)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="Edit post"
                  >
                    <Pencil size={18} />
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={handleDeletePost}
                    disabled={deletePost.isPending}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600 disabled:opacity-50"
                    title="Delete post"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}

              {/* CLOSE */}

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Close"
              >
                <X size={18} />
              </button>

            </div>
          </div>

          {/* ================= BODY ================= */}

          {isLoading ? (
            <div className="p-10 text-center">
              Loading...
            </div>
          ) : !post ? (
            <div className="p-10 text-center">
              Post not found.
            </div>
          ) : (
            /*
              Mobile:  single column, scrollable — image on top, info + comments below
              Desktop: two-column side-by-side with fixed heights
            */
            <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-2 overflow-y-auto md:overflow-hidden">

              {/* ================= MEDIA (image or video) ================= */}

              <div className="bg-black flex items-center justify-center overflow-hidden shrink-0 md:shrink">
                {post.video?.url ? (
                  /* Video post */
                  <ImageCarousel
                    images={[]}
                    video={post.video}
                    alt={post.caption || "Post"}
                    heightClass="h-auto aspect-square md:h-[520px] md:aspect-auto"
                    fit="contain"
                    bgClass="bg-black"
                  />
                ) : post.images?.length ? (
                  /* Image carousel */
                  <ImageCarousel
                    images={post.images}
                    alt={post.caption || "Post"}
                    heightClass="h-auto aspect-square md:h-[520px] md:aspect-auto"
                    fit="contain"
                    bgClass="bg-black"
                  />
                ) : (
                  <div className="text-white py-20 aspect-square md:h-[520px] md:aspect-auto flex items-center justify-center">
                    No media
                  </div>
                )}
              </div>

              {/* ================= RIGHT SIDE ================= */}

              {/*
                Mobile: flex column that fills remaining height so CommentList
                can grow/scroll and the input sticks to the bottom.
                Desktop: fixed 520px height.
              */}
              <div className="flex flex-col flex-1 min-h-0 md:h-[520px]">

                {/* POST INFORMATION */}

                <div className="p-4 border-b shrink-0">

                  {/* LIKE */}

                  <div className="flex items-center justify-between">

                    <button
                      onClick={() => likePost.mutate(postId)}
                      disabled={likePost.isPending}
                      className="flex items-center gap-2"
                    >
                      <Heart
                        size={22}
                        className={
                          isPostLiked
                            ? "text-red-500"
                            : ""
                        }
                        fill={
                          isPostLiked
                            ? "currentColor"
                            : "none"
                        }
                      />

                      <span className="text-sm font-semibold">
                        {post.likes?.length || 0}
                      </span>
                    </button>

                  </div>

                  {/* CAPTION */}

                  {post.caption && (
                    <div className="mt-3 text-sm">

                      <Link
                        to={`/profile/${post.owner._id}`}
                        onClick={onClose}
                        className="font-semibold mr-2 hover:underline"
                      >
                        {post.owner.username}
                      </Link>

                      {post.caption}

                    </div>
                  )}

                  {/* ARCHIVED LABEL */}

                  {isArchived && (
                    <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500">
                      <Archive size={15} />
                      This post is archived
                    </div>
                  )}

                </div>

                {/* COMMENTS */}

                <CommentList
                  postId={postId}
                  currentUserId={myId}
                />

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}

      {openEditPost && post && (
        <EditPostModal
          post={post}
          onClose={() => setOpenEditPost(false)}
        />
      )}
    </>
  );
};

export default PostDetailsModal;