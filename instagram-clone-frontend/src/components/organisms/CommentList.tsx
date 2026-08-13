import { useState } from "react";

import { useComments, useCreateComment } from "../../hooks/useComment";
import CommentCard from "./CommentCard";

type Props = {
  postId: string;
  currentUserId?: string;
};

const CommentList = ({ postId, currentUserId }: Props) => {
  const [text, setText] = useState("");

  const { data, isLoading } = useComments(postId);
  const createComment = useCreateComment();

  const comments = data?.comments || [];

  const rootComments = comments.filter((c: any) => !c.parentComment);

  const repliesByParent = comments.reduce((acc: Record<string, any[]>, c: any) => {
    if (!c.parentComment) return acc;

    const parentId =
      typeof c.parentComment === "string" ? c.parentComment : c.parentComment?._id;

    acc[parentId] = acc[parentId] || [];
    acc[parentId].push(c);

    return acc;
  }, {});

  const handleCreateComment = () => {
    if (!text.trim()) return;

    createComment.mutate(
      { postId, text },
      { onSuccess: () => setText("") }
    );
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && <div>Loading comments...</div>}

        {!isLoading && rootComments.length === 0 && (
          <div className="text-center text-gray-500">No comments yet.</div>
        )}

        {rootComments.map((comment: any) => (
          <CommentCard
            key={comment._id}
            postId={postId}
            comment={comment}
            currentUserId={currentUserId}
            replies={repliesByParent[comment._id] || []}
          />
        ))}
      </div>

      <div className="border-t p-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreateComment()}
          placeholder="Write a comment..."
          className="flex-1 border rounded-lg px-3 py-2 outline-none"
        />
        <button
          onClick={handleCreateComment}
          disabled={createComment.isPending}
          className="bg-blue-600 text-white px-5 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default CommentList;
