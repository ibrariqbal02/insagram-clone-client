import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImagePlus, X, Film } from "lucide-react";

import { useCreatePost } from "../../hooks/usePost";
import { useMe } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

const MAX_CAPTION_LENGTH = 2200;
const ACCEPTED = "image/jpeg,image/png,image/jpg,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo";

type MediaMode = "images" | "video";

const CreatePost = () => {
  const navigate   = useNavigate();
  const { data: me } = useMe();

  const [files,       setFiles]       = useState<File[]>([]);
  const [previews,    setPreviews]    = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption,     setCaption]     = useState("");
  const [isDragging,  setIsDragging]  = useState(false);
  const [step,        setStep]        = useState<"select" | "preview" | "caption">("select");
  const [mediaMode,   setMediaMode]   = useState<MediaMode>("images");
  const [error,       setError]       = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost   = useCreatePost();

  useEffect(() => {
    if (files.length === 0) { setPreviews([]); return; }
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    setActiveIndex(0);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError(null);

    const arr = Array.from(list);
    const isVideo = arr.some((f) => f.type.startsWith("video/"));
    const isImage = arr.some((f) => f.type.startsWith("image/"));

    if (isVideo && isImage) {
      setError("A post can contain either images or a single video, not both.");
      return;
    }

    if (isVideo && arr.length > 1) {
      setError("Only one video per post is allowed.");
      return;
    }

    setMediaMode(isVideo ? "video" : "images");
    setFiles(isVideo ? [arr[0]] : arr.slice(0, 5));
    setStep("preview");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDiscard = () => {
    setFiles([]);
    setCaption("");
    setError(null);
    setStep("select");
  };

  const handleShare = () => {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("caption", caption);
    // field name is "media" — matches the updated backend route
    files.forEach((f) => formData.append("media", f));
    createPost.mutate(formData, {
      onSuccess: () => { setFiles([]); setCaption(""); navigate("/"); },
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  // ── Step: select ─────────────────────────────────────────
  if (step === "select") {
    return (
      <div className="flex flex-col min-h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 border-b border-gray-200" style={{ height: 48 }}>
          <button onClick={() => navigate(-1)} className="text-gray-800">
            <X size={22} />
          </button>
          <span className="text-base font-semibold">New post</span>
          <span className="w-8" />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-5 flex-1 px-8
            transition ${isDragging ? "bg-blue-50" : "bg-white"}
          `}
        >
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <ImagePlus size={44} strokeWidth={1} className="text-gray-400" />
          </div>
          <p className="text-xl font-light text-gray-700">Add photos and videos</p>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold text-sm rounded-lg px-5 py-2 transition"
          >
            Select from gallery
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      </div>
    );
  }

  // ── Step: preview ─────────────────────────────────────────
  if (step === "preview") {
    return (
      <div className="flex flex-col min-h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 border-b border-gray-200" style={{ height: 48 }}>
          <button onClick={handleDiscard} className="text-gray-800">
            <ChevronLeft size={26} />
          </button>
          <span className="text-base font-semibold">
            {mediaMode === "video" ? "Preview" : "Crop"}
          </span>
          <button
            onClick={() => setStep("caption")}
            className="text-[#0095f6] font-semibold text-sm"
          >
            Next
          </button>
        </div>

        {/* Media preview */}
        <div className="relative w-full aspect-square bg-black overflow-hidden">
          {mediaMode === "video" ? (
            <video
              src={previews[0]}
              className="w-full h-full object-contain"
              controls
              playsInline
              aria-label="Video preview"
            />
          ) : (
            <>
              <img
                src={previews[activeIndex]}
                alt={`Preview ${activeIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {previews.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => Math.min(previews.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {previews.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Go to image ${i + 1}`}
                        className={`rounded-full transition-all ${
                          i === activeIndex ? "bg-white w-2 h-2" : "bg-white/50 w-1.5 h-1.5"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium rounded-full px-2 py-0.5">
                    {activeIndex + 1} / {previews.length}
                  </span>
                </>
              )}
            </>
          )}
        </div>

        {/* Thumbnails strip (images only) */}
        {mediaMode === "images" && files.length > 1 && (
          <div className="flex gap-1.5 px-3 py-2 overflow-x-auto">
            {previews.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition ${
                  i === activeIndex ? "border-[#0095f6]" : "border-transparent"
                }`}
              >
                <img src={url} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}

            {/* Add more images button */}
            {files.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-14 h-14 rounded bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300"
                aria-label="Add more images"
              >
                <ImagePlus size={22} />
              </button>
            )}
          </div>
        )}

        {/* Video badge */}
        {mediaMode === "video" && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
            <Film size={16} />
            <span>{files[0]?.name}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple={mediaMode === "images"}
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
    );
  }

  // ── Step: caption ─────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 border-b border-gray-200" style={{ height: 48 }}>
        <button onClick={() => setStep("preview")} className="text-gray-800">
          <ChevronLeft size={26} />
        </button>
        <span className="text-base font-semibold">New post</span>
        <button
          onClick={handleShare}
          disabled={createPost.isPending}
          className="text-[#0095f6] font-semibold text-sm disabled:opacity-50"
        >
          {createPost.isPending ? "Sharing…" : "Share"}
        </button>
      </div>

      {/* Thumbnail + caption */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100">
        {/* Mini preview */}
        <div className="w-16 h-16 rounded overflow-hidden bg-black shrink-0">
          {mediaMode === "video" ? (
            <video src={previews[0]} className="w-full h-full object-cover" muted />
          ) : (
            <img src={previews[0]} alt="Preview" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">{me?.user?.username}</p>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
            placeholder="Write a caption…"
            rows={4}
            className="w-full resize-none text-sm text-gray-800 placeholder-gray-400 outline-none"
            style={{ fontSize: 16 }}
          />
          <p className="text-xs text-gray-400 text-right">
            {caption.length} / {MAX_CAPTION_LENGTH}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm px-4 pt-3">{error}</p>
      )}
    </div>
  );
};

export default CreatePost;
