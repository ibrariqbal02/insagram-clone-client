import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

import { useCompleteOnboarding } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { LANGUAGES, type LanguageLevel } from "../../data/languages";
import {
  ENGLISH_LEVELS,
  LEARNING_LANGUAGE_CODE,
  PRACTICE_GOALS,
  type PracticeGoal,
} from "../../data/english";
import Logo from "../../components/atoms/Logo";
import { useToast } from "../../components/ui/Toast";

const STEP_TITLES = [
  "What language do you speak?",
  "How good is your English?",
  "Why are you learning English?",
  "One last thing",
];

const TOTAL_STEPS = STEP_TITLES.length;

/** Full-width selectable row used for level and goal choices. */
const OptionRow = ({
  selected,
  onClick,
  title,
  description,
  emoji,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  emoji?: string;
  badge?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`
      flex items-center gap-3 w-full text-left rounded-xl border p-3.5 min-h-[56px] transition
      focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
      ${
        selected
          ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
          : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-gray-300"
      }
    `}
  >
    {emoji && (
      <span className="text-xl shrink-0" aria-hidden="true">
        {emoji}
      </span>
    )}

    {badge && (
      <span
        className={`shrink-0 w-11 text-center text-sm font-extrabold rounded-lg py-1 ${
          selected
            ? "bg-brand-600 text-white"
            : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300"
        }`}
      >
        {badge}
      </span>
    )}

    <span className="min-w-0 flex-1">
      <span className="block font-semibold text-sm text-gray-900 dark:text-white">
        {title}
      </span>
      {description && (
        <span className="block text-xs text-gray-500 dark:text-neutral-400 mt-0.5 leading-snug">
          {description}
        </span>
      )}
    </span>

    {selected && <Check size={18} className="text-brand-600 shrink-0" aria-hidden="true" />}
  </button>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [nativeLanguage, setNativeLanguage] = useState("");
  const [englishLevel, setEnglishLevel] = useState<LanguageLevel | "">("");
  const [goal, setGoal] = useState<PracticeGoal | "">("");
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "granted" | "denied">(
    "idle"
  );

  const requestMicAccess = async () => {
    setMicStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("granted");
      showToast("Microphone ready", "success");
    } catch {
      setMicStatus("denied");
    }
  };

  const goNext = () => {
    setStepError(null);

    if (step === 0 && !nativeLanguage) {
      setStepError("Pick the language you speak best.");
      return;
    }

    if (step === 1 && !englishLevel) {
      setStepError("Choose the level that sounds most like you.");
      return;
    }

    if (step === 2 && !goal) {
      setStepError("Pick what you want to practise for.");
      return;
    }

    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const goBack = () => {
    setStepError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = () => {
    completeOnboarding.mutate(
      {
        nativeLanguages: [nativeLanguage],
        // English-only for now; the field stays an array so other languages
        // can be added later without a migration.
        learningLanguages: [
          { code: LEARNING_LANGUAGE_CODE, level: englishLevel as LanguageLevel },
        ],
        goal,
      },
      {
        onSuccess: () => {
          showToast("You're all set — welcome to Speakyard!", "success");
          navigate("/");
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-black flex flex-col items-center px-5 py-8">
      <div className="w-full max-w-md flex flex-col flex-1">
        <Logo size={30} className="mb-7 self-center" />

        {/* Progress */}
        <div className="flex gap-1.5 mb-6" role="presentation">
          {STEP_TITLES.map((title, i) => (
            <div
              key={title}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-brand-500" : "bg-gray-200 dark:bg-neutral-800"
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-400 dark:text-neutral-500 mb-1">
          Step {step + 1} of {TOTAL_STEPS}
        </p>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight">
          {STEP_TITLES[step]}
        </h1>

        {/* Step 0 — native language */}
        {step === 0 && (
          <div>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              This helps us match you with the right practice partners.
            </p>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Your language">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  aria-pressed={nativeLanguage === lang.code}
                  onClick={() => setNativeLanguage(lang.code)}
                  className={`
                    rounded-xl border px-3 min-h-[48px] text-sm font-semibold transition
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
                    ${
                      nativeLanguage === lang.code
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-100"
                        : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-200 hover:border-gray-300"
                    }
                  `}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — English level */}
        {step === 1 && (
          <div className="space-y-2" role="group" aria-label="Your English level">
            {ENGLISH_LEVELS.map((level) => (
              <OptionRow
                key={level.value}
                badge={level.value}
                title={level.label}
                description={level.description}
                selected={englishLevel === level.value}
                onClick={() => setEnglishLevel(level.value)}
              />
            ))}
          </div>
        )}

        {/* Step 2 — goal */}
        {step === 2 && (
          <div className="space-y-2" role="group" aria-label="Your goal">
            {PRACTICE_GOALS.map((option) => (
              <OptionRow
                key={option.value}
                emoji={option.emoji}
                title={option.label}
                description={option.description}
                selected={goal === option.value}
                onClick={() => setGoal(option.value)}
              />
            ))}
          </div>
        )}

        {/* Step 3 — mic permission */}
        {step === 3 && (
          <div className="text-center py-2">
            <div className="text-5xl mb-4" aria-hidden="true">
              🎙️
            </div>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-5 leading-relaxed">
              Speakyard uses your microphone for speaking practice. You can allow it now, or
              later from your browser settings.
            </p>

            {micStatus === "granted" && (
              <p className="text-sm font-semibold text-brand-600 mb-3">
                Microphone access granted.
              </p>
            )}
            {micStatus === "denied" && (
              <p className="text-sm font-semibold text-red-500 mb-3">
                No problem — you can turn the microphone on later.
              </p>
            )}

            <button
              type="button"
              onClick={requestMicAccess}
              disabled={micStatus === "requesting" || micStatus === "granted"}
              className="
                min-h-[44px] px-5 rounded-xl bg-white dark:bg-neutral-900 border border-gray-300
                dark:border-neutral-700 hover:border-brand-400 font-semibold text-sm transition
                disabled:opacity-60 text-gray-900 dark:text-white
                focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
              "
            >
              {micStatus === "requesting" ? "Requesting…" : "Allow microphone"}
            </button>
          </div>
        )}

        {stepError && (
          <p className="text-red-500 text-sm mt-4" role="alert">
            {stepError}
          </p>
        )}

        {completeOnboarding.isError && (
          <p className="text-red-500 text-sm mt-4" role="alert">
            {getErrorMessage(completeOnboarding.error, "Could not save your profile.")}
          </p>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-2">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="
              min-h-[44px] px-4 text-sm font-semibold text-gray-500 dark:text-neutral-400
              disabled:opacity-0 rounded-xl
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
            "
          >
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={completeOnboarding.isPending}
            className="
              flex-1 max-w-[200px] min-h-[48px] bg-brand-600 hover:bg-brand-700 disabled:opacity-60
              text-white font-bold rounded-xl px-6 transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
            "
          >
            {step < TOTAL_STEPS - 1
              ? "Continue"
              : completeOnboarding.isPending
                ? "Saving…"
                : "Start practising"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
