type Props = {
  emoji?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

/** Friendly empty / error state used across the practice screens. */
const EmptyState = ({ emoji = "✨", title, description, children, className = "" }: Props) => (
  <div
    className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
  >
    <div className="text-4xl mb-3" aria-hidden="true">
      {emoji}
    </div>
    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
    {description && (
      <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-xs leading-relaxed">
        {description}
      </p>
    )}
    {children && <div className="mt-5 flex flex-col sm:flex-row gap-2.5 w-full max-w-xs">{children}</div>}
  </div>
);

export default EmptyState;
