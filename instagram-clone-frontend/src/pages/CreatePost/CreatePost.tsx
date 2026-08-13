import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";

import { useCreatePost } from "../../hooks/usePost";
import { useMe } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

const MAX_CAPTION_LENGTH = 2200;

const CreatePost = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    setActiveIndex(0);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setFiles(Array.from(list).slice(0, 5));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDiscard = () => {
    setFiles([]);
    setCaption("");
  };

  const handleShare = () => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("caption", caption);
    files.forEach((file) => formData.append("images", file));

    createPost.mutate(formData, {
      onSuccess: () => {
        setFiles([]);
        setCaption("");
        navigate("/");
      },
    });
  };

  const hasImages = files.length > 0;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          {hasImages ? (
            <button
              onClick={handleDiscard}
              className="text-sm text-gray-600 hover:text-black"
            >
              Discard
            </button>
          ) : (
            <span className="w-16" />
          )}

          <h1 className="font-semibold">Create new post</h1>

          {hasImages ? (
            <button
              onClick={handleShare}
              disabled={createPost.isPending}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {createPost.isPending ? "Sharing..." : "Share"}
            </button>
          ) : (
            <span className="w-16" />
          )}
        </div>

        {!hasImages ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 px-6 py-24 transition ${
              isDragging ? "bg-blue-50" : ""
            }`}
          >
            <ImagePlus size={80} strokeWidth={1} className="text-gray-400" />
            <p className="text-xl text-gray-700">Drag photos and videos here</p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Select from computer
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image preview */}
            <div className="relative flex h-[420px] items-center justify-center bg-black md:h-[520px]">
              <img
                src={previews[activeIndex]}
                alt={`Selected ${activeIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {previews.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((i) => (i === 0 ? previews.length - 1 : i - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((i) => (i === previews.length - 1 ? 0 : i + 1))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {previews.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === activeIndex ? "bg-blue-500" : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-3 top-3 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white hover:bg-black/60"
              >
                Change photos
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* Caption panel */}
            <div className="flex flex-col p-4">
              <div className="flex items-center gap-3 border-b pb-3">
                {me?.user?.profilePicture ? (
                  <img
                    src={me.user.profilePicture}
                    alt={me.user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                )}
                <span className="text-sm font-semibold">{me?.user?.username}</span>
              </div>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
                placeholder="Write a caption..."
                rows={8}
                className="flex-1 resize-none py-3 text-sm outline-none"
              />

              {createPost.isError && (
                <p className="text-sm text-red-500 pb-2">
                  {getErrorMessage(createPost.error, "Could not create post.")}
                </p>
              )}

              <div className="flex items-center justify-between border-t pt-2 text-xs text-gray-400">
                <span>
                  {files.length > 1 ? `${activeIndex + 1}/${files.length} photos` : ""}
                </span>
                <span>
                  {caption.length}/{MAX_CAPTION_LENGTH}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
