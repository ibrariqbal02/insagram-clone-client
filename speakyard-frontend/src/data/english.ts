import type { LanguageLevel } from "./languages";

/**
 * Speakyard is English-only for now: every learner practises English, so the
 * UI never asks which language to learn. The data model stays multi-language
 * (learningLanguages is still an array), we just always send code "en".
 */
export const LEARNING_LANGUAGE_CODE = "en";

export const ENGLISH_LEVELS: {
  value: LanguageLevel;
  label: string;
  description: string;
}[] = [
  { value: "A1", label: "Beginner", description: "I know a few words and short phrases" },
  { value: "A2", label: "Elementary", description: "I can handle simple, everyday sentences" },
  { value: "B1", label: "Intermediate", description: "I can hold a basic conversation" },
  { value: "B2", label: "Upper intermediate", description: "I can talk comfortably about most topics" },
  { value: "C1", label: "Advanced", description: "I speak fluently with few mistakes" },
  { value: "C2", label: "Fluent", description: "I speak like a confident native speaker" },
];

export const levelLabel = (value?: string) =>
  ENGLISH_LEVELS.find((l) => l.value === value)?.label ?? "";

export type PracticeGoal = "travel" | "job" | "study" | "daily";

export const PRACTICE_GOALS: {
  value: PracticeGoal;
  emoji: string;
  label: string;
  description: string;
}[] = [
  { value: "travel", emoji: "✈️", label: "Travel", description: "Airports, hotels, directions" },
  { value: "job", emoji: "💼", label: "Work", description: "Interviews, meetings, emails" },
  { value: "study", emoji: "🎓", label: "Study", description: "Exams, classes, presentations" },
  { value: "daily", emoji: "💬", label: "Daily talk", description: "Small talk and making friends" },
];

export const goalLabel = (value?: string) =>
  PRACTICE_GOALS.find((g) => g.value === value)?.label ?? "";

/** Rotating practice topic with three phrases a learner can use today. */
export const DAILY_TOPICS: { title: string; phrases: string[] }[] = [
  {
    title: "Ordering at a café",
    phrases: [
      "Could I get a flat white, please?",
      "Is this table free?",
      "Can I pay by card?",
    ],
  },
  {
    title: "Meeting someone new",
    phrases: [
      "Nice to meet you — what do you do?",
      "How long have you been living here?",
      "We should keep in touch.",
    ],
  },
  {
    title: "Asking for directions",
    phrases: [
      "Excuse me, how do I get to the station?",
      "Is it within walking distance?",
      "Could you say that again, please?",
    ],
  },
  {
    title: "In a job interview",
    phrases: [
      "I'd describe myself as a quick learner.",
      "In my last role, I was responsible for…",
      "Could you tell me more about the team?",
    ],
  },
  {
    title: "Making small talk",
    phrases: [
      "Have you been up to much this weekend?",
      "The weather's been lovely lately.",
      "I know what you mean!",
    ],
  },
  {
    title: "On the phone",
    phrases: [
      "Sorry, could you speak up a little?",
      "Let me check and get back to you.",
      "Thanks for your help — have a good day!",
    ],
  },
  {
    title: "Talking about your day",
    phrases: [
      "It's been a pretty busy day, actually.",
      "I'm looking forward to the weekend.",
      "Nothing much — just the usual.",
    ],
  },
];

/** Picks the topic for today so everyone sees the same one on a given day. */
export const topicOfTheDay = (date = new Date()) => {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return DAILY_TOPICS[dayNumber % DAILY_TOPICS.length];
};
