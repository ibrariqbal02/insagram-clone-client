import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  onSend: (text: string) => void;
  loading: boolean;
};

const MessageInput = ({ onSend, loading }: Props) => {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input whenever the chat window mounts or the
  // conversation changes (parent unmounts/remounts this component).
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText("");
    // Keep focus after sending so the user can type the next message immediately
    inputRef.current?.focus();
  };

  return (
    <div
      className="border-t border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2.5 shrink-0"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom, 10px))" }}
    >
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Message..."
        disabled={loading}
        className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-gray-400 focus:bg-white transition disabled:opacity-50"
      />

      <button
        onClick={handleSend}
        disabled={!text.trim() || loading}
        className={`shrink-0 rounded-full p-2.5 transition ${
          text.trim() && !loading
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Send size={18} />
      </button>
    </div>
  );
};

export default MessageInput;
