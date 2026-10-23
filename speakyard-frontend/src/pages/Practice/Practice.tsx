import { useMyProfile } from "../../hooks/useProfile";
import { languageName } from "../../data/languages";

// MVP home screen — replaces the old Instagram-style feed (still at
// src/pages/Home, just not linked from navigation; see Phase 2.3).
// AI practice partner (2.4-2.8) and human practice calls (2.9-2.14) are
// not built yet, so this is a holding placeholder that still reflects the
// user's onboarding choices.
const Practice = () => {
  const { data } = useMyProfile();
  const user = data?.user;
  const learningLanguages = user?.learningLanguages ?? [];

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="text-5xl mb-4">🗣️</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        {learningLanguages.length > 0
          ? `Ready to practice ${learningLanguages.map((l: any) => languageName(l.code)).join(", ")}?`
          : "Ready to practice?"}
      </h1>
      <p className="text-gray-500 text-sm max-w-xs">
        AI practice sessions and live voice calls with other learners are coming soon. Check back
        here to start a conversation.
      </p>
    </div>
  );
};

export default Practice;
