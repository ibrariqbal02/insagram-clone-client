import { useState } from "react";
import { useParams } from "react-router-dom";
import { SquarePen, Users } from "lucide-react";

import ConversationList from "../../components/organisms/ConversationList";
import ChatWindow from "../../components/organisms/ChatWindow";
import NewConversationModal from "../../components/organisms/NewConversationModal";
import NewGroupConversationModal from "../../components/organisms/NewGroupConversationModal";

const Messages = () => {
  const { conversationId } = useParams();

  const [openDMModal, setOpenDMModal] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);

  return (
    <div className="h-full overflow-hidden bg-white lg:rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-3 h-full">

        {/* ── Conversation list (left panel) ── */}
        <div
          className={`border-r flex flex-col h-full overflow-hidden ${
            conversationId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center shrink-0">
            <h2 className="text-xl font-semibold">Messages</h2>

            <div className="flex items-center gap-1">
              {/* New group */}
              <button
                onClick={() => setOpenGroupModal(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="New group chat"
              >
                <Users size={20} />
              </button>

              {/* New DM */}
              <button
                onClick={() => setOpenDMModal(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title="New message"
              >
                <SquarePen size={20} />
              </button>
            </div>
          </div>

          <ConversationList selectedConversationId={conversationId} />
        </div>

        {/* ── Chat window (right panel) ── */}
        <div
          className={`md:col-span-2 h-full overflow-hidden ${
            conversationId ? "block" : "hidden md:block"
          }`}
        >
          {conversationId ? (
            <ChatWindow conversationId={conversationId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation
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
