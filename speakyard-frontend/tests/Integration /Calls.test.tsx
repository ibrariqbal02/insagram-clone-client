import { describe, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Calls from "../../src/pages/Calls/Calls";

describe("Calls Component", () => {
  it("renders a helpful empty state with both practice buttons", () => {
    render(<Calls />);

    expect(screen.getByText(/no practice calls yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /talk to ai/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /practise with a person/i })
    ).toBeInTheDocument();
  });

  it("opens the AI coming soon sheet", async () => {
    const user = userEvent.setup();
    render(<Calls />);

    await user.click(screen.getByRole("button", { name: /talk to ai/i }));

    expect(screen.getByText(/ai partner is almost ready/i)).toBeInTheDocument();
  });

  it("opens the human calls coming soon sheet", async () => {
    const user = userEvent.setup();
    render(<Calls />);

    await user.click(screen.getByRole("button", { name: /practise with a person/i }));

    expect(screen.getByText(/live practice calls are coming/i)).toBeInTheDocument();
  });
});
