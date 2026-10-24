import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Practice from "../../src/pages/Practice/Practice";
import { useMyProfile } from "../../src/hooks/useProfile";
import { useOnlinePartners, usePracticeStats } from "../../src/hooks/useAuth";
import { useCreateConversation } from "../../src/hooks/useConversation";

jest.mock("../../src/hooks/useProfile", () => ({
  useMyProfile: jest.fn(),
}));

jest.mock("../../src/hooks/useAuth", () => ({
  useOnlinePartners: jest.fn(),
  usePracticeStats: jest.fn(),
}));

jest.mock("../../src/hooks/useConversation", () => ({
  useCreateConversation: jest.fn(),
}));

jest.mock("../../src/hooks/useSocket", () => ({
  useOnlinePartnersSync: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

const mockShowToast = jest.fn();
jest.mock("../../src/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe("Practice (home dashboard)", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMyProfile as jest.Mock).mockReturnValue({
      data: { user: { _id: "me", name: "Ibrar Iqbal" } },
      isLoading: false,
    });

    (usePracticeStats as jest.Mock).mockReturnValue({
      data: {
        stats: {
          streakDays: 3,
          minutesToday: 4,
          minutesTotal: 40,
          callsCount: 2,
          dailyGoalMinutes: 10,
        },
      },
      isLoading: false,
    });

    (useOnlinePartners as jest.Mock).mockReturnValue({
      data: { users: [] },
      isLoading: false,
    });

    (useCreateConversation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it("greets the user by first name and shows the streak and goal ring", () => {
    render(<Practice />);

    expect(screen.getByText(/ibrar/i)).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("/ 10 min")).toBeInTheDocument();
  });

  it("never claims the user is practising another language", () => {
    (useMyProfile as jest.Mock).mockReturnValue({
      data: {
        user: { _id: "me", name: "Ibrar", learningLanguages: [{ code: "hi", level: "A1" }] },
      },
      isLoading: false,
    });

    render(<Practice />);

    expect(screen.queryByText(/hindi/i)).not.toBeInTheDocument();
    expect(screen.getByText(/practise your english/i)).toBeInTheDocument();
  });

  it("shows the topic of the day with three phrases", () => {
    render(<Practice />);

    expect(screen.getByText(/topic of the day/i)).toBeInTheDocument();
    const quoteMarks = screen.getAllByText("“");
    expect(quoteMarks).toHaveLength(3);
  });

  it("opens a coming soon sheet from the Talk to AI card", async () => {
    const user = userEvent.setup();
    render(<Practice />);

    await user.click(screen.getByRole("button", { name: /talk to ai/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ai partner is almost ready/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /got it/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a coming soon sheet from the practise with a person card", async () => {
    const user = userEvent.setup();
    render(<Practice />);

    await user.click(screen.getByRole("button", { name: /practise with a person/i }));

    expect(screen.getByText(/live practice calls are coming/i)).toBeInTheDocument();
  });

  it("tells the user when nobody is online", () => {
    render(<Practice />);

    expect(screen.getByText(/nobody else is online right now/i)).toBeInTheDocument();
  });

  it("lists online partners and starts a chat from the Message button", async () => {
    const user = userEvent.setup();

    (useOnlinePartners as jest.Mock).mockReturnValue({
      data: {
        users: [
          {
            _id: "partner-1",
            name: "Ana Lopez",
            username: "ana",
            learningLanguages: [{ code: "en", level: "B1" }],
          },
        ],
      },
      isLoading: false,
    });

    render(<Practice />);

    expect(screen.getByText("Ana Lopez")).toBeInTheDocument();
    expect(screen.getByText(/english b1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /message/i }));

    expect(mockMutate).toHaveBeenCalledWith("partner-1", expect.any(Object));
  });
});
