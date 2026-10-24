import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Flame, MessageCircle, Users } from "lucide-react";

import { useMyProfile } from "../../hooks/useProfile";
import { useOnlinePartners, usePracticeStats } from "../../hooks/useAuth";
import { useOnlinePartnersSync } from "../../hooks/useSocket";
import { useCreateConversation } from "../../hooks/useConversation";
import { levelLabel, topicOfTheDay } from "../../data/english";
import Avatar from "../../components/atoms/Avatar";
import Skeleton from "../../components/ui/Skeleton";
import ComingSoonSheet from "../../components/ui/ComingSoonSheet";
import { useToast } from "../../components/ui/Toast";

const greeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/** Circular progress ring for today's speaking minutes. */
const GoalRing = ({ minutes, goal }: { minutes: number; goal: number }) => {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = goal > 0 ? Math.min(minutes / goal, 1) : 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-gray-200 dark:stroke-neutral-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="stroke-brand-500 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold leading-none text-gray-900 dark:text-white">
          {minutes}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-neutral-400 leading-none mt-0.5">
          / {goal} min
        </span>
      </div>
    </div>
  );
};

const PracticeCard = ({
  icon: Icon,
  title,
  description,
  accent,
  onClick,
}: {
  icon: typeof Bot;
  title: string;
  description: string;
  accent: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="
      group flex items-center gap-4 w-full text-left rounded-2xl p-4 min-h-[88px]
      border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900
      hover:border-brand-400 hover:shadow-md transition
      focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
    "
  >
    <span
      className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${accent}`}
      aria-hidden="true"
    >
      <Icon size={22} />
    </span>
    <span className="min-w-0">
      <span className="block font-bold text-gray-900 dark:text-white">{title}</span>
      <span className="block text-sm text-gray-500 dark:text-neutral-400 leading-snug">
        {description}
      </span>
    </span>
  </button>
);

const Practice = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: profileData, isLoading: profileLoading } = useMyProfile();
  const { data: statsData, isLoading: statsLoading } = usePracticeStats();
  const { data: partnersData, isLoading: partnersLoading } = useOnlinePartners();
  useOnlinePartnersSync();

  const createConversation = useCreateConversation();

  const [sheet, setSheet] = useState<null | "ai" | "people">(null);

  const user = profileData?.user;
  const firstName = user?.name?.trim()?.split(" ")[0] ?? "there";

  const stats = statsData?.stats;
  const minutesToday = stats?.minutesToday ?? 0;
  const dailyGoal = stats?.dailyGoalMinutes ?? 10;
  const streakDays = stats?.streakDays ?? 0;

  const partners: any[] = partnersData?.users ?? [];
  const topic = topicOfTheDay();

  const handleMessage = (partnerId: string) => {
    createConversation.mutate(partnerId, {
      onSuccess: (data) => navigate(`/messages/${data.conversation._id}`),
      onError: () => showToast("Could not open that chat. Please try again.", "error"),
    });
  };

  return (
    <div className="px-4 py-5 md:px-0 md:py-6 space-y-5 max-w-2xl mx-auto w-full">
      {/* ── Greeting + goal ring ─────────────────────── */}
      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <div className="flex items-center gap-5">
          <div className="min-w-0 flex-1">
            {profileLoading ? (
              <>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : (
              <>
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                  {greeting()}, {firstName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                  Ready to practise your English today?
                </p>
              </>
            )}

            <div className="flex items-center gap-1.5 mt-3 text-sm">
              <Flame size={16} className="text-orange-500 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {statsLoading ? "—" : streakDays}
              </span>
              <span className="text-gray-500 dark:text-neutral-400">
                day streak
              </span>
            </div>
          </div>

          {statsLoading ? (
            <Skeleton className="w-[88px] h-[88px]" circle />
          ) : (
            <GoalRing minutes={minutesToday} goal={dailyGoal} />
          )}
        </div>
      </section>

      {/* ── Practice cards ───────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500 px-1">
          Start practising
        </h2>

        <PracticeCard
          icon={Bot}
          title="Talk to AI"
          description="Practise any time with your AI speaking partner"
          accent="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200"
          onClick={() => setSheet("ai")}
        />

        <PracticeCard
          icon={Users}
          title="Practise with a person"
          description="Get matched with another learner for a real conversation"
          accent="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200"
          onClick={() => setSheet("people")}
        />
      </section>

      {/* ── Topic of the day ─────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500 mb-1">
          Topic of the day
        </h2>
        <p className="font-bold text-gray-900 dark:text-white mb-3">{topic.title}</p>

        <ul className="space-y-2">
          {topic.phrases.map((phrase) => (
            <li
              key={phrase}
              className="flex gap-2.5 text-sm text-gray-700 dark:text-neutral-300 leading-relaxed"
            >
              <span className="text-brand-600 dark:text-brand-400 shrink-0" aria-hidden="true">
                “
              </span>
              <span>{phrase}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── People to practice with ──────────────────── */}
      <section className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400 dark:text-neutral-500 mb-3">
          People to practise with
        </h2>

        {partnersLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10" circle />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1.5" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        ) : partners.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400 leading-relaxed">
            Nobody else is online right now. Try the AI partner above — or check back a
            little later.
          </p>
        ) : (
          <ul className="space-y-1">
            {partners.map((partner) => {
              const level = partner.learningLanguages?.[0]?.level;

              return (
                <li key={partner._id} className="flex items-center gap-3 py-1.5">
                  <button
                    onClick={() => navigate(`/profile/${partner._id}`)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="relative shrink-0">
                      <Avatar src={partner.profilePicture} name={partner.name} size={10} />
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-brand-500 border-2 border-white dark:border-neutral-900"
                        title="Online"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {partner.name}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-neutral-400 truncate">
                        {level ? `English ${level} · ${levelLabel(level)}` : "Learning English"}
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => handleMessage(partner._id)}
                    disabled={createConversation.isPending}
                    className="
                      shrink-0 min-h-[44px] px-4 rounded-xl text-sm font-semibold
                      bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-60
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
                      flex items-center gap-1.5
                    "
                  >
                    <MessageCircle size={15} />
                    Message
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
          description="We're building voice calls so you can be matched with another learner and talk for real. In the meantime, message someone below."
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
};

export default Practice;
