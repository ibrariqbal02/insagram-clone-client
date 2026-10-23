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

/** Minimum horizontal swipe distance (px) to trigger slide */
const SWIPE_THRESHOLD = 40;

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

  // ── Touch state for swipe ────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging  = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current  = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // If the gesture is more horizontal than vertical, mark it as a drag
    // and prevent page scroll so the carousel gets the event.
    if (Math.abs(dx) > Math.abs(dy)) {
      isDragging.current = true;
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;

    if (isDragging.current && Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx < 0) {
        // Swiped left → next
        setIndex((i) => Math.min(images.length - 1, i + 1));
      } else {
        // Swiped right → prev
        setIndex((i) => Math.max(0, i - 1));
      }
    } else if (!isDragging.current) {
      // Pure tap (no swipe) — fire onClick
      onClick?.();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current  = false;
  };

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

  const total   = images.length;
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
      // Desktop click
      onClick={total === 1 ? onClick : undefined}
      // Touch gestures
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // Prevents iOS rubber-band while swiping horizontally
      style={{ touchAction: total > 1 ? "pan-y pinch-zoom" : "auto" }}
    >
      <img
        src={images[index].url}
        alt={`${alt} ${index + 1}`}
        className={`w-full h-full object-${fit} select-none`}
        draggable={false}
      />

      {/* Desktop arrow buttons — hidden on touch devices via pointer:fine media */}
      {hasPrev && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition hidden sm:flex items-center justify-center"
          aria-label="Previous image"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition hidden sm:flex items-center justify-center"
          aria-label="Next image"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {total > 1 && (
        <>
          {/* Dot indicators */}
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

          {/* Counter badge */}
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium rounded-full px-2 py-0.5 select-none">
            {index + 1} / {total}
          </span>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
