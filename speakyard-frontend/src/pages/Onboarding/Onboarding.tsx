import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompleteOnboarding } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/getErrorMessage";
import {
  INTEREST_OPTIONS,
  LANGUAGES,
  LANGUAGE_LEVELS,
  languageName,
  type LanguageLevel,
} from "../../data/languages";

type LearningLanguage = { code: string; level: LanguageLevel };

const STEP_TITLES = [
  "What languages do you speak?",
  "What are you learning?",
  "Tell us a bit about you",
  "Just to confirm",
  "One last thing",
];

const TOTAL_STEPS = STEP_TITLES.length;

const Chip = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      selected
        ? "bg-blue-500 border-blue-500 text-white"
        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
    }`}
  >
    {children}
  </button>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [nativeLanguages, setNativeLanguages] = useState<string[]>([]);
  const [learningLanguages, setLearningLanguages] = useState<LearningLanguage[]>([]);
  const [newLearningCode, setNewLearningCode] = useState(LANGUAGES[0].code);
  const [newLearningLevel, setNewLearningLevel] = useState<LanguageLevel>("A1");
  const [country, setCountry] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [birthYear, setBirthYear] = useState("");
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "granted" | "denied">(
    "idle"
  );

  const toggleNativeLanguage = (code: string) => {
    setNativeLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const addLearningLanguage = () => {
    if (learningLanguages.some((l) => l.code === newLearningCode)) return;
    setLearningLanguages((prev) => [...prev, { code: newLearningCode, level: newLearningLevel }]);
  };

  const removeLearningLanguage = (code: string) => {
    setLearningLanguages((prev) => prev.filter((l) => l.code !== code));
  };

  const requestMicAccess = async () => {
    setMicStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("granted");
    } catch {
      setMicStatus("denied");
    }
  };

  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - Number(birthYear) : null;

  const goNext = () => {
    setStepError(null);

    if (step === 0 && nativeLanguages.length === 0) {
      setStepError("Pick at least one language you speak.");
      return;
    }

    if (step === 1 && learningLanguages.length === 0) {
      setStepError("Add at least one language you want to practice.");
      return;
    }

    if (step === 3 && birthYear && (age === null || age < 18)) {
      setStepError("You must be at least 18 years old to use Speakyard.");
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
        nativeLanguages,
        learningLanguages,
        country: country.trim() || undefined,
        interests,
        birthYear: birthYear ? Number(birthYear) : null,
      },
      {
        onSuccess: () => navigate("/"),
      }
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {STEP_TITLES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-400 mb-1">
          Step {step + 1} of {TOTAL_STEPS}
        </p>
        <h1 className="text-xl font-bold text-gray-900 mb-5">{STEP_TITLES[step]}</h1>

        {/* Step 0 — native languages */}
        {step === 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Languages you speak">
            {LANGUAGES.map((lang) => (
              <Chip
                key={lang.code}
                selected={nativeLanguages.includes(lang.code)}
                onClick={() => toggleNativeLanguage(lang.code)}
              >
                {lang.name}
              </Chip>
            ))}
          </div>
        )}

        {/* Step 1 — learning languages + level */}
        {step === 1 && (
          <div>
            <div className="flex gap-2 mb-3">
              <select
                aria-label="Language to practice"
                value={newLearningCode}
                onChange={(e) => setNewLearningCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Your level"
                value={newLearningLevel}
                onChange={(e) => setNewLearningLevel(e.target.value as LanguageLevel)}
                className="border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                {LANGUAGE_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.value}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addLearningLanguage}
                className="bg-gray-900 text-white text-sm font-semibold rounded-md px-3"
              >
                Add
              </button>
            </div>

            {learningLanguages.length === 0 ? (
              <p className="text-sm text-gray-400">No languages added yet.</p>
            ) : (
              <ul className="space-y-2">
                {learningLanguages.map((lang) => (
                  <li
                    key={lang.code}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm"
                  >
                    <span>
                      {languageName(lang.code)} ·{" "}
                      {LANGUAGE_LEVELS.find((l) => l.value === lang.level)?.label ?? lang.level}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${languageName(lang.code)}`}
                      onClick={() => removeLearningLanguage(lang.code)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 2 — country + interests (goals) */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1.5">
                Country
              </label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Where are you from?"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1.5">
                What do you want to talk about? (optional)
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
                {INTEREST_OPTIONS.map((interest) => (
                  <Chip
                    key={interest}
                    selected={interests.includes(interest)}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — birth year */}
        {step === 3 && (
          <div>
            <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1.5">
              Birth year
            </label>
            <input
              id="birthYear"
              type="number"
              inputMode="numeric"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              You must be 18+ to join voice calls with other people. You can skip this for now.
            </p>
          </div>
        )}

        {/* Step 4 — mic permission */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🎙️</div>
            <p className="text-sm text-gray-500 mb-5">
              Speakyard uses your microphone for voice practice. You can allow it now or later from
              your browser settings.
            </p>

            {micStatus === "granted" && (
              <p className="text-sm font-semibold text-green-600 mb-3">Microphone access granted.</p>
            )}
            {micStatus === "denied" && (
              <p className="text-sm font-semibold text-red-500 mb-3">
                Microphone access was denied. You can enable it later in your browser settings.
              </p>
            )}

            <button
              type="button"
              onClick={requestMicAccess}
              disabled={micStatus === "requesting" || micStatus === "granted"}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold rounded-lg px-5 py-2 text-sm transition"
            >
              {micStatus === "requesting" ? "Requesting…" : "Allow microphone access"}
            </button>
          </div>
        )}

        {stepError && <p className="text-red-500 text-xs mt-3">{stepError}</p>}

        {completeOnboarding.isError && (
          <p className="text-red-500 text-xs mt-3">
            {getErrorMessage(completeOnboarding.error, "Could not save your profile.")}
          </p>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="text-sm font-semibold text-gray-500 disabled:opacity-0"
          >
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={completeOnboarding.isPending}
            className="bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2 text-sm transition"
          >
            {step < TOTAL_STEPS - 1
              ? "Next"
              : completeOnboarding.isPending
                ? "Saving…"
                : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
