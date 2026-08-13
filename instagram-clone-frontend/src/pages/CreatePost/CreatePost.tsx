import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";

import { useCreatePost } from "../../hooks/usePost";
import { useMe } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";

const MAX_CAPTION_LENGTH = 2200;

const CreatePost = () => {
  const navigate = useNavigate();
  const { data: me } = useMe();

  const [files,       setFiles]       = useState<File[]>([]);
  const [previews,    setPreviews]    = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption,     setCaption]     = useState("");
  const [isDragging,  setIsDragging]  = useState(false);
  const [step,        setStep]        = useState<"select" | "preview" | "caption">("select");

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
    setFiles(Array.from(list).slice(0, 5));
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
    setStep("select");
  };

  const handleShare = () => {
    if (files.length === 0) return;
    const formData = new FormData();
    formData.append("caption", caption);
    files.forEach((f) => formData.append("images", f));
    createPost.mutate(formData, {
      onSuccess: () => { setFiles([]); setCaption(""); navigate("/"); },
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
            accept="image/*"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>
      </div>
    );
  }

  // ── Step: preview / crop ─────────────────────────────────
  if (step === "preview") {
    return (
      <div className="flex flex-col min-h-full bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 border-b border-gray-200" style={{ height: 48 }}>
          <button onClick={handleDiscard} className="text-gray-800">
            <ChevronLeft size={26} />
          </button>
          <span className="text-base font-semibold">Crop</span>
          <button
            onClick={() => setStep("caption")}
            className="text-[#0095f6] font-semibold text-sm"
          >
            Next
          </button>
        </div>

        {/* Square image preview */}
        <div className="relative w-full aspect-square bg-black overflow-hidden">
          <img
            src={previews[activeIndex]}
            alt={`Preview ${activeIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {previews.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i === 0 ? previews.length - 1 : i - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((i) => (i === previews.length - 1 ? 0 : i + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {previews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      i === activeIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Change photos */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 top-3 bg-black/50 text-white text-xs font-medium rounded-full px-3 py-1.5"
          >
            Change
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

        {/* Thumbnail strip — visible when multiple images */}
        {previews.length > 1 && (
          <div className="flex gap-0.5 px-0.5 py-1 bg-white border-b border-gray-100 overflow-x-auto">
            {previews.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`shrink-0 w-16 h-16 overflow-hidden ${
                  i === activeIndex ? "ring-2 ring-[#0095f6]" : "opacity-60"
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Step: caption ────────────────────────────────────────
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

      {/* Caption editor */}
      <div className="flex gap-3 px-4 py-3 border-b border-gray-100">
        {/* Thumbnail */}
        <div className="w-14 h-14 shrink-0 rounded overflow-hidden bg-gray-100">
          <img
            src={previews[0]}
            alt="Selected"
            className="w-full h-full object-cover"
          />
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
          placeholder="Write a caption…"
          rows={4}
          className="flex-1 resize-none text-sm text-gray-900 placeholder:text-gray-400 outline-none leading-snug pt-0.5"
          autoFocus
        />
      </div>

      {/* Character count */}
      <div className="px-4 py-2 text-xs text-gray-400 text-right border-b border-gray-100">
        {caption.length}/{MAX_CAPTION_LENGTH}
      </div>

      {/* User info row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        {me?.user?.profilePicture ? (
          <img
            src={me.user.profilePicture}
            alt={me.user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        )}
        <span className="text-sm font-semibold text-gray-900">
          {me?.user?.username}
        </span>
      </div>

      {createPost.isError && (
        <p className="px-4 py-2 text-sm text-red-500">
          {getErrorMessage(createPost.error, "Could not create post.")}
        </p>
      )}
    </div>
  );
};

export default CreatePost;
