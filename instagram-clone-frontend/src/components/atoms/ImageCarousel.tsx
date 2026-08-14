import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = {
  url: string;
  publicId?: string;
};

type Props = {
  images: MediaItem[];
  /** Optional single video. If provided, it is shown instead of the images carousel. */
  video?: { url: string; publicId?: string };
  alt?: string;
  /** Tailwind class(es) for the media height, e.g. "h-[500px]" */
  heightClass?: string;
  /** object-cover (default) | object-contain */
  fit?: "cover" | "contain";
  /** Background colour class behind the media, e.g. "bg-black" */
  bgClass?: string;
  onClick?: () => void;
};

const ImageCarousel = ({
  images,
  video,
  alt = "Post",
  heightClass = "h-[500px]",
  fit = "cover",
  bgClass = "bg-black",
  onClick,
}: Props) => {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Video post ───────────────────────────────────────────
  if (video?.url) {
    return (
      <div
        className={`relative w-full ${heightClass} ${bgClass} overflow-hidden`}
        onClick={onClick}
      >
        <video
          ref={videoRef}
          src={video.url}
          className={`w-full h-full object-${fit}`}
          controls
          playsInline
          preload="metadata"
          aria-label={alt}
          onClick={(e) => e.stopPropagation()} // let controls work without triggering onClick
        />
      </div>
    );
  }

  // ── Image carousel ───────────────────────────────────────
  if (!images || images.length === 0) return null;

  const total = images.length;
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => Math.max(0, i - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => Math.min(total - 1, i + 1));
  };

  return (
    <div
      className={`relative w-full ${heightClass} ${bgClass} overflow-hidden`}
      onClick={onClick}
    >
      <img
        src={images[index].url}
        alt={`${alt} ${index + 1}`}
        className={`w-full h-full object-${fit} select-none`}
        draggable={false}
      />

      {hasPrev && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
          aria-label="Previous image"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
          aria-label="Next image"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all ${
                i === index ? "bg-white w-2 h-2" : "bg-white/50 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {total > 1 && (
        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium rounded-full px-2 py-0.5 select-none">
          {index + 1} / {total}
        </span>
      )}
    </div>
  );
};

export default ImageCarousel;
