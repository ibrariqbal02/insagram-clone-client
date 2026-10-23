import { useEffect, useRef, useState } from "react";
import { Archive, ArchiveRestore, Pencil, Trash2 } from "lucide-react";

import { useArchivePost, useDeletePost, useUnarchivePost } from "../../hooks/usePost";
import EditPostModal from "./EditPostModal";

type Post = {
  _id: string;
  caption: string;
  images: { url: string; publicId: string }[];
  status: "active" | "archived";
};

type Props = {
  post: Post;
  /** Called after a successful delete or archive so the parent can close/refresh */
  onPostRemoved?: () => void;
};

const PostOptionsMenu = ({ post, onPostRemoved }: Props) => {
  const [open, setOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deletePost = useDeletePost();
  const archivePost = useArchivePost();
  const unarchivePost = useUnarchivePost();

  const isArchived = post.status === "archived";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // ─── handlers ────────────────────────────────────────────────────────────────

  const handleDelete = () => {
    setOpen(false);
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    deletePost.mutate(post._id, {
      onSuccess: () => onPostRemoved?.(),
    });
  };

  const handleArchive = () => {
    setOpen(false);
    const ok = window.confirm("Archive this post?");
    if (!ok) return;

    archivePost.mutate(post._id, {
      onSuccess: () => onPostRemoved?.(),
    });
  };

  const handleUnarchive = () => {
    setOpen(false);
    const ok = window.confirm("Unarchive this post?");
    if (!ok) return;

    unarchivePost.mutate(post._id);
  };

  const handleEdit = () => {
    setOpen(false);
    setShowEditModal(true);
  };

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div ref={menuRef} className="relative">
        {/* Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="Post options"
          aria-haspopup="true"
          aria-expanded={open}
        >
          {/* Three-dot icon drawn inline so this component has no extra imports */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">

            {/* Archive / Unarchive */}
            {isArchived ? (
              <button
                onClick={handleUnarchive}
                disabled={unarchivePost.isPending}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-50 transition"
              >
                <ArchiveRestore size={16} />
                Unarchive
              </button>
            ) : (
              <button
                onClick={handleArchive}
                disabled={archivePost.isPending}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-50 transition"
              >
                <Archive size={16} />
                Archive
              </button>
            )}

            {/* Edit */}
            <button
              onClick={handleEdit}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition"
            >
              <Pencil size={16} />
              Edit
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={deletePost.isPending}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
            >
              <Trash2 size={16} />
              Delete
            </button>

          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditPostModal
          post={post}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
};

export default PostOptionsMenu;
