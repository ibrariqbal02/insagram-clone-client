import { useState } from "react";
import { Bot, Users } from "lucide-react";

import EmptyState from "../../components/ui/EmptyState";
import ComingSoonSheet from "../../components/ui/ComingSoonSheet";

/** Calls history — placeholder until practice calls (2.9-2.15) are built. */
const Calls = () => {
  const [sheet, setSheet] = useState<null | "ai" | "people">(null);

  const buttonClass =
    "flex items-center justify-center gap-2 min-h-[48px] w-full rounded-xl px-4 font-bold text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="px-4 pt-5 md:pt-6">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Calls</h1>
      </div>

      <EmptyState
        emoji="📞"
        title="No practice calls yet"
        description="Once you finish a call it will show up here, with who you spoke to and for how long."
      >
        <button
          onClick={() => setSheet("ai")}
          className={`${buttonClass} bg-brand-600 hover:bg-brand-700 text-white`}
        >
          <Bot size={17} />
          Talk to AI
        </button>

        <button
          onClick={() => setSheet("people")}
          className={`${buttonClass} bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white`}
        >
          <Users size={17} />
          Practise with a person
        </button>
      </EmptyState>

      {sheet === "ai" && (
        <ComingSoonSheet
          emoji="🤖"
          title="AI partner is almost ready"
          description="Soon you'll be able to call an AI partner any time, speak freely, and get gentle corrections after each session."
          onClose={() => setSheet(null)}
        />
      )}

      {sheet === "people" && (
        <ComingSoonSheet
          emoji="🎧"
          title="Live practice calls are coming"
          description="We're building voice calls so you can be matched with another learner and talk for real."
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
};

export default Calls;
