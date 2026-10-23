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

describe("Onboarding Component", () => {
  const mockMutate = jest.fn<
    (data: unknown, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => void
  >();

  beforeEach(() => {
    jest.clearAllMocks();

    (useCompleteOnboarding as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    // jsdom has no real media devices implementation
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: jest.fn<(...args: any[]) => Promise<any>>(),
      },
      configurable: true,
    });
  });

  const renderOnboarding = () => {
    return render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
  };

  it("shows a validation error if Next is clicked with no native language picked", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    expect(screen.getByText(/what languages do you speak/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText(/pick at least one language you speak/i)).toBeInTheDocument();
    expect(screen.getByText(/what languages do you speak/i)).toBeInTheDocument();
  });

  it("advances to the learning-language step once a native language is picked", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole("button", { name: "English" }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText(/what are you learning/i)).toBeInTheDocument();
  });

  it("requires at least one learning language before advancing", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole("button", { name: "English" }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(
      screen.getByText(/add at least one language you want to practice/i)
    ).toBeInTheDocument();
  });

  it("blocks a birth year that would make the user under 18", async () => {
    const user = userEvent.setup();
    renderOnboarding();

    // Step 1: native language
    await user.click(screen.getByRole("button", { name: "English" }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 2: learning language
    await user.selectOptions(screen.getByLabelText(/language to practice/i), "es");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 3: country/interests — skip
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 4: birth year — too young
    const underageYear = new Date().getFullYear() - 10;
    await user.type(screen.getByLabelText(/birth year/i), String(underageYear));
    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText(/at least 18 years old/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("completes the full flow and submits the expected payload", async () => {
    const user = userEvent.setup();
    mockMutate.mockImplementation((_data, options) => {
      options?.onSuccess?.();
    });
    renderOnboarding();

    // Step 1: native language
    await user.click(screen.getByRole("button", { name: "English" }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 2: learning language
    await user.selectOptions(screen.getByLabelText(/language to practice/i), "es");
    await user.selectOptions(screen.getByLabelText(/your level/i), "B1");
    await user.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.getByRole("listitem")).toHaveTextContent("Spanish");
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 3: country + interests
    await user.type(screen.getByLabelText(/country/i), "Canada");
    await user.click(screen.getByRole("button", { name: "Travel" }));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 4: birth year — valid adult
    await user.type(screen.getByLabelText(/birth year/i), "2000");
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Step 5: mic permission — skip straight to finish
    await user.click(screen.getByRole("button", { name: /finish/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        nativeLanguages: ["en"],
        learningLanguages: [{ code: "es", level: "B1" }],
        country: "Canada",
        interests: ["Travel"],
        birthYear: 2000,
      },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
