import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Image = {
  url: string;
  publicId?: string;
};

type Props = {
  images: Image[];
  alt?: string;
  /** Tailwind class(es) for the image height, e.g. "h-[500px]" */
  heightClass?: string;
  /** object-cover (default) | object-contain */
  fit?: "cover" | "contain";
  /** Background colour class behind the image, e.g. "bg-black" */
  bgClass?: string;
  onClick?: () => void;
};

const ImageCarousel = ({
  images,
  alt = "Post",
  heightClass = "h-[500px]",
  fit = "cover",
  bgClass = "bg-black",
  onClick,
}: Props) => {
  const [index, setIndex] = useState(0);

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
      {/* Image */}
      <img
        src={images[index].url}
        alt={`${alt} ${index + 1}`}
        className={`w-full h-full object-${fit} select-none`}
        draggable={false}
      />

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
          aria-label="Previous image"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition"
          aria-label="Next image"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Dot indicators — only shown when there are multiple images */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i); }}
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all ${
                i === index
                  ? "bg-white w-2 h-2"
                  : "bg-white/50 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* Counter badge top-right (e.g. "2 / 4") */}
      {total > 1 && (
        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium rounded-full px-2 py-0.5 select-none">
          {index + 1} / {total}
        </span>
      )}
    </div>
  );
};

export default ImageCarousel;
