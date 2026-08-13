type Props = {
  src?: string | null;
  name?: string | null;
  size?: number; // tailwind size number, e.g. 9 → w-9 h-9
  className?: string;
};

/**
 * Displays a profile picture. Falls back to a circle with the user's initial
 * when the image is missing or fails to load.
 */
const Avatar = ({ src, name, size = 9, className = "" }: Props) => {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  const sizeClass = `w-${size} h-${size}`;
  const base = `${sizeClass} rounded-full object-cover shrink-0 ${className}`;

  if (!src) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold shrink-0 ${className}`}
        style={{ fontSize: `${Math.max(size * 0.4, 10)}px` }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? "avatar"}
      className={base}
      onError={(e) => {
        // Swap broken image for an initials div
        const target = e.currentTarget;
        const parent = target.parentNode;
        if (!parent) return;

        const fallback = document.createElement("div");
        fallback.className = `${sizeClass} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold shrink-0 ${className}`;
        fallback.style.fontSize = `${Math.max(size * 0.4, 10)}px`;
        fallback.textContent = initial;

        parent.replaceChild(fallback, target);
      }}
    />
  );
};

export default Avatar;
