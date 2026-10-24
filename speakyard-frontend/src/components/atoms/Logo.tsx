type MarkProps = {
  size?: number;
  className?: string;
};

/**
 * Speakyard mark — a speech bubble with sound waves.
 * Used on its own (sidebar, favicon-ish spots) or next to the wordmark.
 */
export const LogoMark = ({ size = 32, className = "" }: MarkProps) => (
  <span
    className={`inline-flex items-center justify-center rounded-xl bg-brand-600 text-white shrink-0 ${className}`}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size * 0.6, height: size * 0.6 }}
    >
      <path d="M20 12a7 7 0 0 1-7 7H8l-4 3v-5.2A7 7 0 0 1 8 5h5a7 7 0 0 1 7 7Z" />
      <path d="M9.5 10.5v3M12.5 9v6M15.5 11v1.5" />
    </svg>
  </span>
);

type LogoProps = {
  size?: number;
  className?: string;
  /** Hide the wordmark and show only the mark */
  markOnly?: boolean;
};

const Logo = ({ size = 32, className = "", markOnly = false }: LogoProps) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <LogoMark size={size} />
    {!markOnly && (
      <span
        className="font-logo font-extrabold tracking-tight text-gray-900 dark:text-white leading-none"
        style={{ fontSize: size * 0.68 }}
      >
        Speakyard
      </span>
    )}
  </span>
);

export default Logo;
