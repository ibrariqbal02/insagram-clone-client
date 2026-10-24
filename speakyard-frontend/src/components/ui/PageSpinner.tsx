const PageSpinner = () => {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-white dark:bg-black"
      role="status"
      aria-live="polite"
    >
      <div className="w-8 h-8 border-2 border-gray-200 dark:border-neutral-800 border-t-brand-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500 dark:text-neutral-400">Loading…</p>
    </div>
  );
};

export default PageSpinner;
