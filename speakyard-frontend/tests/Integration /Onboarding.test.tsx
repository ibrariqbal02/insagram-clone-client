import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Onboarding from "../../src/pages/Onboarding/Onboarding";
import { useCompleteOnboarding } from "../../src/hooks/useAuth";

jest.mock("../../src/hooks/useAuth", () => ({
  useCompleteOnboarding: jest.fn(),
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

describe("Onboarding (English only)", () => {
  const mockMutate = jest.fn<
    (data: unknown, options?: { onSuccess?: () => void }) => void
  >();

  beforeEach(() => {
    jest.clearAllMocks();

    (useCompleteOnboarding as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: jest.fn<(...args: any[]) => Promise<any>>() },
      configurable: true,
    });
  });

  const renderOnboarding = () =>
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

  it("never asks which language the user wants to learn", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    expect(screen.getByText(/what language do you speak/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Spanish" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Step 2 is the English level, not a language picker
    expect(screen.getByText(/how good is your english/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/language to practice/i)).not.toBeInTheDocument();
  });

  it("shows plain-English descriptions for each level", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole("button", { name: "Spanish" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/i know a few words and short phrases/i)).toBeInTheDocument();
    expect(screen.getByText(/i can hold a basic conversation/i)).toBeInTheDocument();
  });

  it("blocks each step until an answer is picked", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText(/pick the language you speak best/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Spanish" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText(/choose the level that sounds most like you/i)).toBeInTheDocument();
  });

  it("submits native language, English level and goal", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_data, options) => options?.onSuccess?.());

    renderOnboarding();

    // Native language
    await user.click(screen.getByRole("button", { name: "Spanish" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // English level
    await user.click(screen.getByRole("button", { name: /B1 Intermediate/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Goal
    await user.click(screen.getByRole("button", { name: /travel/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Mic step → finish
    await user.click(screen.getByRole("button", { name: /start practising/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        nativeLanguages: ["es"],
        learningLanguages: [{ code: "en", level: "B1" }],
        goal: "travel",
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
