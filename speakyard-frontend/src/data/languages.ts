export type Language = { code: string; name: string };

// Common practice languages for the MVP — not exhaustive, "Other" covers the rest.
export const LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "vi", name: "Vietnamese" },
];

export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const LANGUAGE_LEVELS: { value: LanguageLevel; label: string }[] = [
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Fluent" },
];

// Shown as chips during onboarding so a new user can tag what they want to talk about.
export const INTEREST_OPTIONS: string[] = [
  "Travel",
  "Movies & TV",
  "Music",
  "Food",
  "Sports",
  "Business",
  "Technology",
  "Books",
  "Gaming",
  "Culture",
];

export const languageName = (code: string): string =>
  LANGUAGES.find((l) => l.code === code)?.name ?? code;
