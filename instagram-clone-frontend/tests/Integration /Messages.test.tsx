import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Messages from "../../src/pages/Messages/Messages";


jest.mock("../../src/components/organisms/ConversationList", () => {
  return function MockConversationList({ selectedConversationId }: { selectedConversationId?: string }) {
    return (
      <div data-testid="conversation-list">
        Conversation List (Selected: {selectedConversationId ?? "none"})
      </div>
    );
  };
});

jest.mock("../../src/components/organisms/ChatWindow", () => {
  return function MockChatWindow({ conversationId }: { conversationId: string }) {
    return <div data-testid="chat-window">Chat Window for Conversation: {conversationId}</div>;
  };
});

jest.mock("../../src/components/organisms/NewConversationModal", () => {
  return function MockNewConversationModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="new-conversation-modal">
        New Conversation Modal
        <button data-testid="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

describe("Messages Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderMessages = (initialEntries = ["/messages"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
        </Routes>
      </MemoryRouter>
    );
  };


  it("renders messages header, conversation list, and default placeholder when no conversation is selected", () => {
    renderMessages(["/messages"]);

    expect(screen.getByRole("heading", { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByTestId("conversation-list")).toHaveTextContent("Selected: none");
    expect(screen.getByText(/select a conversation/i)).toBeInTheDocument();
    expect(screen.queryByTestId("chat-window")).not.toBeInTheDocument();
  });


  it("renders ChatWindow with the active conversationId from URL parameters", () => {
    renderMessages(["/messages/conv-123"]);

    expect(screen.getByTestId("conversation-list")).toHaveTextContent("Selected: conv-123");
    expect(screen.getByTestId("chat-window")).toHaveTextContent("Chat Window for Conversation: conv-123");
    expect(screen.queryByText(/select a conversation/i)).not.toBeInTheDocument();
  });


  it("opens and closes NewConversationModal when clicking action button and close trigger", async () => {
    const user = userEvent.setup();
    renderMessages(["/messages"]);


    expect(screen.queryByTestId("new-conversation-modal")).not.toBeInTheDocument();

    
    const newMsgBtn = screen.getByRole("button");
    await user.click(newMsgBtn);

    
    expect(screen.getByTestId("new-conversation-modal")).toBeInTheDocument();

    await user.click(screen.getByTestId("close-modal-btn"));

  
    expect(screen.queryByTestId("new-conversation-modal")).not.toBeInTheDocument();
  });
});