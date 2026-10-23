import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";

import { useReels } from "../../hooks/useFeed";
import { useLikeUnlikePost } from "../../hooks/usePost";
import { useMe } from "../../hooks/useAuth";
import Avatar from "../../components/atoms/Avatar";
import PostDetailsModal from "../../components/organisms/PostDetailsModal";

/* ─────────────────────────────────────────────────────────────
   Single reel card — fills the full viewport height, auto-plays
   when scrolled into view via IntersectionObserver.
───────────────────────────────────────────────────────────── */
type ReelCardProps = {
  reel: any;
  isMuted: boolean;
  onMuteToggle: () => void;
  onOpenComments: (id: string) => void;
};

const ReelCard = ({ reel, isMuted, onMuteToggle, onOpenComments }: ReelCardProps) => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { data: me } = useMe();
  const myId = me?.user?._id;
  const like  = useLikeUnlikePost();

  const isLiked = (reel.likes || []).some((id: string) => id === myId);

  // Auto-play when the card is >= 60% visible
  useEffect(() => {
    const el  = wrapRef.current;
    const vid = videoRef.current;
    if (!el || !vid) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          vid.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          vid.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  return (
    /*
     * Each card is exactly 100dvh tall so one reel fills the screen.
     * On desktop it's centred at max-w-sm so it looks like Instagram Reels.
     */
    <div
      ref={wrapRef}
      className="relative flex-shrink-0 w-full h-[100dvh] bg-black overflow-hidden snap-start"
    >
      {/* ── Video ── */}
      <video
        ref={videoRef}
        src={reel.video?.url}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        onClick={togglePlay}
        aria-label={reel.caption || "Reel"}
      />

      {/* Play overlay — shown briefly after manual pause */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          <div className="bg-black/30 rounded-full p-5">
            <Play size={40} className="text-white fill-white" />
          </div>
        </div>
      )}

      {/* ── Gradient overlay (bottom) ── */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* ── Bottom-left: owner + caption ── */}
      <div className="absolute bottom-20 left-3 right-16 text-white">
        <Link
          to={`/profile/${reel.owner?._id}`}
          className="flex items-center gap-2 mb-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar
            src={reel.owner?.profilePicture}
            name={reel.owner?.name}
            size={8}
          />
          <span className="font-semibold text-sm drop-shadow">
            {reel.owner?.username}
          </span>
        </Link>

        {reel.caption && (
          <p className="text-sm leading-snug line-clamp-3 drop-shadow">
            {reel.caption}
          </p>
        )}
      </div>

      {/* ── Right action column ── */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
        {/* Like */}
        <button
          onClick={() => like.mutate(reel._id)}
          disabled={like.isPending}
          className="flex flex-col items-center gap-1"
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <Heart
            size={28}
            strokeWidth={1.8}
            className={isLiked ? "text-red-500" : "text-white"}
            fill={isLiked ? "currentColor" : "none"}
          />
          <span className="text-xs font-semibold drop-shadow">
            {reel.likes?.length ?? 0}
          </span>
        </button>

        {/* Comments */}
        <button
          onClick={() => onOpenComments(reel._id)}
          className="flex flex-col items-center gap-1"
          aria-label="Comments"
        >
          <MessageCircle size={28} strokeWidth={1.8} className="text-white" />
          <span className="text-xs font-semibold drop-shadow">
            {reel.commentsCount ?? 0}
          </span>
        </button>

        {/* Share */}
        <button
          className="flex flex-col items-center gap-1"
          aria-label="Share"
        >
          <Send size={26} strokeWidth={1.8} className="text-white" />
        </button>

        {/* Save */}
        <button
          className="flex flex-col items-center gap-1"
          aria-label="Save"
        >
          <Bookmark size={26} strokeWidth={1.8} className="text-white" />
        </button>

        {/* Mute toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted
            ? <VolumeX size={24} strokeWidth={1.8} className="text-white" />
            : <Volume2 size={24} strokeWidth={1.8} className="text-white" />
          }
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Reels page — vertical snap scroll list of ReelCards
───────────────────────────────────────────────────────────── */
const Reels = () => {
  const { data, isLoading } = useReels();
  const [isMuted,      setIsMuted]      = useState(true);
  const [openPostId,   setOpenPostId]   = useState<string | null>(null);

  const reels: any[] = data?.reels ?? [];

  const handleMuteToggle = useCallback(() => setIsMuted((v) => !v), []);

  if (isLoading) {
    return (
      <div className="h-[100dvh] bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-[100dvh] bg-black flex flex-col items-center justify-center text-white text-center px-8 gap-4">
        <div className="text-5xl">🎬</div>
        <p className="text-lg font-semibold">No reels yet</p>
        <p className="text-sm text-gray-400">
          Upload a video post to see it here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/*
        Full-screen vertical scroll with CSS snap.
        Each child card is exactly 100dvh so users scroll one reel at a time.
        The page lives outside the normal content wrapper so it gets
        edge-to-edge black background.
      */}
      <div className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory scroll-smooth hide-scrollbar">
        {/* Desktop: centre the feed at max-w-sm (like real Instagram Reels) */}
        <div className="lg:flex lg:justify-center">
          <div className="lg:w-[400px] w-full">
            {reels.map((reel: any) => (
              <ReelCard
                key={reel._id}
                reel={reel}
                isMuted={isMuted}
                onMuteToggle={handleMuteToggle}
                onOpenComments={setOpenPostId}
              />
            ))}
          </div>
        </div>
      </div>

      {openPostId && (
        <PostDetailsModal
          postId={openPostId}
          onClose={() => setOpenPostId(null)}
        />
      )}
    </>
  );
};

export default Reels;
