import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  description: string;
  emoji?: string;
  onClose: () => void;
};

/**
 * Bottom sheet (mobile) / centred card (desktop) used for features that are
 * planned but not built yet — AI calls (2.4-2.8) and human calls (2.9-2.15).
 */
const ComingSoonSheet = ({ title, description, emoji = "🚀", onClose }: Props) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end md:items-center justify-center bg-black/50 px-0 md:px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full md:max-w-sm bg-white dark:bg-neutral-900
          rounded-t-2xl md:rounded-2xl p-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] md:pb-6
          shadow-xl text-center relative
        "
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 w-11 h-11 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X size={18} />
        </button>

        {/* Drag handle (mobile) */}
        <div className="md:hidden w-10 h-1 rounded-full bg-gray-200 dark:bg-neutral-700 mx-auto mb-5" />

        <div className="text-4xl mb-3" aria-hidden="true">
          {emoji}
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed mb-6">
          {description}
        </p>

        <button
          onClick={onClose}
          className="w-full min-h-[44px] bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl px-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default ComingSoonSheet;
