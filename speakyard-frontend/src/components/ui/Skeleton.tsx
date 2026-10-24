type Props = {
  className?: string;
  /** Rounded-full instead of rounded-lg (for avatars) */
  circle?: boolean;
};

/** Grey placeholder block shown while data loads. */
const Skeleton = ({ className = "", circle = false }: Props) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-neutral-800 ${
      circle ? "rounded-full" : "rounded-lg"
    } ${className}`}
    aria-hidden="true"
  />
);

export default Skeleton;
