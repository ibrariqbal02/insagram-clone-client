import { useState } from "react";
import { useParams } from "react-router-dom";
import { SquarePen, Users } from "lucide-react";

import ConversationList from "../../components/organisms/ConversationList";
import ChatWindow from "../../components/organisms/ChatWindow";
import NewConversationModal from "../../components/organisms/NewConversationModal";
import NewGroupConversationModal from "../../components/organisms/NewGroupConversationModal";

const Messages = () => {
  const { conversationId } = useParams();

  const [openDMModal,    setOpenDMModal]    = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);

  return (
    /*
     * Full-height container — MainLayout sets overflow-hidden + h-full for this route.
     * On mobile: single column, list hides when a chat is open.
     * On desktop: 3-col grid (list | chat).
     */
    <div className="h-full overflow-hidden bg-white md:rounded-xl md:shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">

        {/* ── Conversation list ─────────────────────── */}
        <div
          className={`
            flex flex-col h-full overflow-hidden border-r border-gray-200
            ${conversationId ? "hidden md:flex" : "flex"}
          `}
        >
          {/* Header */}
          <div
            className="
              shrink-0 px-4 border-b border-gray-200 bg-white
              flex justify-between items-center
            "
            style={{ height: 56 }}
          >
            <h2 className="text-base font-extrabold text-gray-900 leading-none">
              Messages
            </h2>

            <div className="flex items-center gap-0.5">
              {/* New group */}
              <button
                onClick={() => setOpenGroupModal(true)}
                className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="New group chat"
              >
                <Users size={22} strokeWidth={1.8} />
              </button>

              {/* New DM */}
              <button
                onClick={() => setOpenDMModal(true)}
                className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-gray-100 transition text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="New message"
              >
                <SquarePen size={22} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* List */}
          <ConversationList selectedConversationId={conversationId} />
        </div>

        {/* ── Chat window ───────────────────────────── */}
        <div
          className={`
            md:col-span-2 h-full overflow-hidden
            ${conversationId ? "block" : "hidden md:block"}
          `}
        >
          {conversationId ? (
            <ChatWindow conversationId={conversationId} />
          ) : (
            /* Desktop empty state */
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                <SquarePen size={26} strokeWidth={1.8} className="text-brand-700" />
              </div>
              <p className="font-bold text-gray-900 mb-1">Your messages</p>
              <p className="text-sm text-gray-500 mb-5 max-w-xs leading-relaxed">
                Start a conversation with a practice partner — writing is great practice too.
              </p>
              <button
                onClick={() => setOpenDMModal(true)}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl px-5 min-h-[44px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                New message
              </button>
            </div>
          )}
        </div>
      </div>

      {openDMModal && (
        <NewConversationModal onClose={() => setOpenDMModal(false)} />
      )}
      {openGroupModal && (
        <NewGroupConversationModal onClose={() => setOpenGroupModal(false)} />
      )}
    </div>
  );
};

export default Messages;
