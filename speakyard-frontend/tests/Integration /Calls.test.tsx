import { describe, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Calls from "../../src/pages/Calls/Calls";

describe("Calls Component", () => {
  it("renders the empty-state placeholder", () => {
    render(<Calls />);

    expect(screen.getByText(/no calls yet/i)).toBeInTheDocument();
  });
});
