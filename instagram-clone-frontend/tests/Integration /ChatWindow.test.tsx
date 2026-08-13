import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWindow from "../../src/components/organisms/ChatWindow";
import { useMessages, useSendMessage } from "../../src/hooks/useMessage";
import { useMyProfile } from "../../src/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";


jest.mock("../../src/hooks/useMessage", () => ({
  useMessages: jest.fn(),
  useSendMessage: jest.fn(),
}));

jest.mock("../../src/hooks/useProfile", () => ({
  useMyProfile: jest.fn(),
}));


jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));


jest.mock("../../src/components/organisms/MessageBubble", () => {
  return function MockMessageBubble({
    message,
    isMine,
  }: {
    message: { _id: string; content: string };
    isMine: boolean;
  }) {
    return (
      <div data-testid={`message-bubble-${message._id}`}>
        {message.content} - {isMine ? "Mine" : "Their"}
      </div>
    );
  };
});

jest.mock("../../src/components/organisms/MessageInput", () => {
  return function MockMessageInput({
    onSend,
    loading,
  }: {
    onSend: (text: string) => void;
    loading: boolean;
  }) {
    return (
      <div data-testid="message-input">
        <button
          disabled={loading}
          onClick={() => onSend("Hello world!")}
        >
          Send Message
        </button>
      </div>
    );
  };
});

describe("ChatWindow Component", () => {
  const mockSendMessageMutate = jest.fn();
  const mockGetQueryData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    (useMyProfile as jest.Mock).mockReturnValue({
      data: { user: { _id: "user-me" } },
    });

    (useSendMessage as jest.Mock).mockReturnValue({
      mutate: mockSendMessageMutate,
      isPending: false,
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: mockGetQueryData,
    });
  });

  const conversationId = "conv-123";

 
  it("renders loading text while fetching messages", () => {
    (useMessages as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<ChatWindow conversationId={conversationId} />);

    expect(screen.getByText(/loading messages\.\.\./i)).toBeInTheDocument();
  });


  it("renders recipient details in the header from query cache", () => {
    (useMessages as jest.Mock).mockReturnValue({
      data: { messages: [] },
      isLoading: false,
    });

    mockGetQueryData.mockReturnValue({
      conversations: [
        {
          _id: conversationId,
          participants: [
            { _id: "user-me", name: "Me" },
            {
              _id: "user-other",
              name: "Jane Doe",
              username: "janedoe",
              profilePicture: "https://example.com/jane.jpg",
            },
          ],
        },
      ],
    });

    render(<ChatWindow conversationId={conversationId} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("@janedoe")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Jane Doe" })).toHaveAttribute(
      "src",
      "https://example.com/jane.jpg"
    );
  });

  it("renders initial letter avatar fallback when profilePicture is missing", () => {
    (useMessages as jest.Mock).mockReturnValue({
      data: { messages: [] },
      isLoading: false,
    });

    mockGetQueryData.mockReturnValue({
      conversations: [
        {
          _id: conversationId,
          participants: [
            { _id: "user-me", name: "Me" },
            { _id: "user-other", name: "Alice Smith" },
          ],
        },
      ],
    });

    render(<ChatWindow conversationId={conversationId} />);

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); 
  });

  it("renders empty state placeholder when conversation has no messages", () => {
    (useMessages as jest.Mock).mockReturnValue({
      data: { messages: [] },
      isLoading: false,
    });

    render(<ChatWindow conversationId={conversationId} />);

    expect(screen.getByText(/start your conversation 👋/i)).toBeInTheDocument();
  });

  it("renders message bubbles and correctly sets isMine prop", () => {
    (useMessages as jest.Mock).mockReturnValue({
      data: {
        messages: [
          { _id: "m1", content: "Hey there!", sender: { _id: "user-other" } },
          { _id: "m2", content: "Hi Jane!", sender: { _id: "user-me" } },
        ],
      },
      isLoading: false,
    });

    render(<ChatWindow conversationId={conversationId} />);

    const bubble1 = screen.getByTestId("message-bubble-m1");
    const bubble2 = screen.getByTestId("message-bubble-m2");

    expect(bubble1).toHaveTextContent("Hey there! - Their");
    expect(bubble2).toHaveTextContent("Hi Jane! - Mine");
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });
  });



  it("triggers sendMessage mutation with current conversationId and content", async () => {
    const user = userEvent.setup();
    (useMessages as jest.Mock).mockReturnValue({
      data: { messages: [] },
      isLoading: false,
    });

    render(<ChatWindow conversationId={conversationId} />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(mockSendMessageMutate).toHaveBeenCalledWith({
      conversationId: "conv-123",
      content: "Hello world!",
    });
  });
});