import { useEffect, useRef, useState } from "react";
import { Square, Send, Trash2 } from "lucide-react";

type Props = {
  onSend: (blob: Blob) => void;
  onCancel: () => void;
  loading: boolean;
};

const VoiceRecorder = ({ onSend, onCancel, loading }: Props) => {
  const [phase, setPhase] = useState<"idle" | "recording" | "preview">("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Use refs so callbacks always have the latest values (no stale closures)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>("");

  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Called when user clicks the red stop button
  const stopRecording = () => {
    stopTimer();
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop(); // triggers onstop → phase becomes "preview"
    }
  };

  // Start recording on mount
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const mimeType =
          [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/ogg",
            "audio/mp4",
          ].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

        mimeTypeRef.current = mimeType;

        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          stopStream();
          const blob = new Blob(chunksRef.current, {
            type: mimeTypeRef.current || "audio/webm",
          });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          setPhase("preview");
        };

        recorder.start(100);
        setPhase("recording");

        // Tick every second
        timerRef.current = setInterval(() => {
          setSeconds((prev) => {
            if (prev >= 299) {
              // Auto-stop at 5 minutes — use ref directly, no closure issue
              stopTimer();
              const rec = mediaRecorderRef.current;
              if (rec && rec.state !== "inactive") rec.stop();
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      } catch {
        if (!cancelled) setPermissionDenied(true);
      }
    };

    start();

    return () => {
      cancelled = true;
      stopTimer();
      const rec = mediaRecorderRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    stopTimer();
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    stopStream();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    onCancel();
  };

  const handleSend = () => {
    if (!audioBlob || loading) return;
    onSend(audioBlob);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (permissionDenied) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border-t border-gray-200 text-sm text-red-600">
        <span className="flex-1">Microphone access denied. Please allow it in your browser settings.</span>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-800 transition text-xs underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div
      className="border-t border-gray-200 bg-white px-3 py-2.5 flex items-center gap-3 shrink-0"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))" }}
    >
      {/* Discard button — always visible */}
      <button
        onClick={handleCancel}
        title="Discard recording"
        className="shrink-0 rounded-full p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
      >
        <Trash2 size={18} />
      </button>

      {phase === "idle" && (
        <div className="flex-1 text-sm text-gray-400 text-center">
          Waiting for microphone…
        </div>
      )}

      {phase === "recording" && (
        <>
          {/* Pulsing dot + elapsed time */}
          <div className="flex items-center gap-2 flex-1 min-w-0 select-none">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-medium text-gray-700 tabular-nums">
              {formatTime(seconds)}
            </span>
            <span className="text-xs text-gray-400">Recording…</span>
          </div>

          {/* Stop button */}
          <button
            onClick={stopRecording}
            title="Stop recording"
            className="shrink-0 rounded-full p-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white transition"
          >
            <Square size={16} fill="currentColor" />
          </button>
        </>
      )}

      {phase === "preview" && (
        <>
          {/* Native audio player to preview before sending */}
          {audioUrl && (
            <audio
              src={audioUrl}
              controls
              className="flex-1 h-9 min-w-0"
              style={{ colorScheme: "light" }}
            />
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={loading}
            title="Send voice message"
            className="shrink-0 rounded-full p-2.5 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="block h-[18px] w-[18px] rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
