import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { useUpdatePost } from "../../hooks/usePost";
import { getErrorMessage } from "../../utils/getErrorMessage";

type Props = {
  post: any;
  onClose: () => void;
};

const EditPostModal = ({ post, onClose }: Props) => {
  const updatePost = useUpdatePost();

  const [caption, setCaption] = useState(post.caption || "");
  const [files, setFiles] = useState<FileList | null>(null);
  const [preview, setPreview] = useState<string | null>(post.images?.[0]?.url || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!files || files.length === 0) return;

    const url = URL.createObjectURL(files[0]);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [files]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("caption", caption);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
    }
    updatePost.mutate(
      { postId: post._id, formData },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Edit Post</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {preview && (
            <div className="relative bg-black flex items-center justify-center h-80">
              <img
                src={preview}
                alt="preview"
                className="max-h-full max-w-full object-contain"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-3 right-3 rounded-lg bg-black/40 hover:bg-black/60 text-white text-xs px-3 py-1.5"
              >
                Change photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
          )}

          <div className="px-5 space-y-4 pb-5">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              rows={4}
              placeholder="Write a caption..."
            />

            {updatePost.isError && (
              <p className="text-sm text-red-500">
                {getErrorMessage(updatePost.error, "Could not update post.")}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatePost.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg"
              >
                {updatePost.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
