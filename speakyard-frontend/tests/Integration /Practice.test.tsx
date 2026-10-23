import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Practice from "../../src/pages/Practice/Practice";
import { useMyProfile } from "../../src/hooks/useProfile";

jest.mock("../../src/hooks/useProfile", () => ({
  useMyProfile: jest.fn(),
}));

describe("Practice Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a generic prompt when the user has no learning languages yet", () => {
    (useMyProfile as jest.Mock).mockReturnValue({ data: { user: { learningLanguages: [] } } });

    render(<Practice />);

    expect(screen.getByText(/ready to practice\?/i)).toBeInTheDocument();
  });

  it("mentions the user's learning languages when set", () => {
    (useMyProfile as jest.Mock).mockReturnValue({
      data: { user: { learningLanguages: [{ code: "es", level: "A1" }] } },
    });

    render(<Practice />);

    expect(screen.getByText(/ready to practice spanish\?/i)).toBeInTheDocument();
  });
});
