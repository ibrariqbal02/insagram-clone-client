import { useState } from "react";
import { Heart } from "lucide-react";

import Avatar from "../atoms/Avatar";

import {
  useCreateComment,
  useDeleteComment,
  useLikeUnlikeComment,
  useUpdateComment,
} from "../../hooks/useComment";

type CommentOwner = {
  _id: string;
  name: string;
  username: string;
  profilePicture: string;
};

type CommentType = {
  _id: string;
  text: string;
  owner: CommentOwner;
  likes: string[];
};

type Props = {
  postId: string;
  comment: CommentType;
  currentUserId?: string;
  /** Replies to this comment — only rendered one level deep, Instagram-style */
  replies?: CommentType[];
  isReply?: boolean;
};

const CommentCard = ({
  postId,
  comment,
  currentUserId,
  replies = [],
  isReply = false,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const likeUnlikeComment = useLikeUnlikeComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const createComment = useCreateComment();

  const isMine = comment.owner?._id === currentUserId;
  const isLiked =
    !!currentUserId && (comment.likes || []).some((id) => id === currentUserId);

  const handleLike = () => likeUnlikeComment.mutate(comment._id);

  const handleSaveEdit = () => {
    if (!editText.trim()) return;

    updateComment.mutate(
      { commentId: comment._id, text: editText },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    const ok = window.confirm("Delete this comment?");
    if (!ok) return;

    deleteComment.mutate(comment._id);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    createComment.mutate(
      { postId, text: replyText, parentComment: comment._id },
      {
        onSuccess: () => {
          setReplyText("");
          setIsReplying(false);
        },
      }
    );
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar
        src={comment.owner?.profilePicture}
        name={comment.owner?.name}
        size={isReply ? 7 : 9}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{comment.owner?.username}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-gray-500 hover:text-black"
            >
              <Heart
                size={14}
                className={isLiked ? "text-red-500" : ""}
                fill={isLiked ? "currentColor" : "none"}
              />
              {comment.likes?.length > 0 && (
                <span className="text-xs">{comment.likes.length}</span>
              )}
            </button>

            {isMine && (
              <>
                <button
                  onClick={() => {
                    setEditText(comment.text);
                    setIsEditing((v) => !v);
                  }}
                  className="text-xs text-gray-500 hover:text-black"
                >
                  Edit
                </button>
                <button onClick={handleDelete} className="text-xs text-red-600">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 flex gap-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSaveEdit}
              className="px-4 rounded-lg bg-blue-600 text-white text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 rounded-lg border text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="text-sm mt-1">{comment.text}</div>
        )}

        {!isReply && (
          <button
            onClick={() => setIsReplying((v) => !v)}
            className="text-xs text-gray-500 hover:text-black mt-1"
          >
            Reply
          </button>
        )}

        {isReplying && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              placeholder={`Reply to ${comment.owner?.username}...`}
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
              autoFocus
            />
            <button
              onClick={handleSendReply}
              disabled={createComment.isPending}
              className="px-4 rounded-lg bg-blue-600 text-white text-sm"
            >
              Send
            </button>
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l pl-3">
            {replies.map((reply) => (
              <CommentCard
                key={reply._id}
                postId={postId}
                comment={reply}
                currentUserId={currentUserId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
