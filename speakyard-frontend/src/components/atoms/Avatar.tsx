type Props = {
  src?: string | null;
  name?: string | null;
  /** Tailwind-style size number, e.g. 9 → 36px (size * 4) */
  size?: number;
  className?: string;
};

/** First letter of the user's name — the one place this rule lives. */
const avatarInitial = (name?: string | null) =>
  name?.trim()?.[0]?.toUpperCase() ?? "?";

/**
 * Profile picture with an initials fallback. Sizes are inline pixels rather
 * than `w-${size}` classes, which Tailwind's scanner can't see at build time.
 */
const Avatar = ({ src, name, size = 9, className = "" }: Props) => {
  const initial = avatarInitial(name);
  const px = size * 4;
  const dimensions = { width: px, height: px };

  if (!src) {
    return (
      <div
        className={`rounded-full bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-100 flex items-center justify-center font-bold shrink-0 ${className}`}
        style={{ ...dimensions, fontSize: Math.max(px * 0.4, 10) }}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? "avatar"}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={dimensions}
      onError={(e) => {
        // Swap a broken image for the same initials circle
        const target = e.currentTarget;
        const parent = target.parentNode;
        if (!parent) return;

        const fallback = document.createElement("div");
        fallback.className = `rounded-full bg-brand-100 text-brand-800 flex items-center justify-center font-bold shrink-0 ${className}`;
        fallback.style.width = `${px}px`;
        fallback.style.height = `${px}px`;
        fallback.style.fontSize = `${Math.max(px * 0.4, 10)}px`;
        fallback.textContent = initial;

        parent.replaceChild(fallback, target);
      }}
    />
  );
};

export default Avatar;
