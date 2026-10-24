import { jest, describe, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Avatar from "../../src/components/atoms/Avatar";
import Logo from "../../src/components/atoms/Logo";
import EmptyState from "../../src/components/ui/EmptyState";
import ComingSoonSheet from "../../src/components/ui/ComingSoonSheet";
import { ToastProvider, useToast } from "../../src/components/ui/Toast";
import { topicOfTheDay, levelLabel, goalLabel } from "../../src/data/english";

describe("Avatar", () => {
  it("falls back to the first letter of the name, not the username", () => {
    render(<Avatar name="Jane Doe" />);

    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("uses the same letter rule regardless of size", () => {
    const { rerender } = render(<Avatar name="ana lopez" size={6} />);
    expect(screen.getByText("A")).toBeInTheDocument();

    rerender(<Avatar name="ana lopez" size={20} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders an image when a picture is available", () => {
    render(<Avatar name="Jane" src="https://example.com/jane.jpg" />);

    expect(screen.getByRole("img", { name: "Jane" })).toHaveAttribute(
      "src",
      "https://example.com/jane.jpg"
    );
  });
});

describe("Logo", () => {
  it("shows the Speakyard wordmark", () => {
    render(<Logo />);

    expect(screen.getByText("Speakyard")).toBeInTheDocument();
  });

  it("can render the mark on its own", () => {
    render(<Logo markOnly />);

    expect(screen.queryByText("Speakyard")).not.toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders a title, description and actions", () => {
    render(
      <EmptyState title="No calls yet" description="Start practising">
        <button>Talk to AI</button>
      </EmptyState>
    );

    expect(screen.getByText("No calls yet")).toBeInTheDocument();
    expect(screen.getByText("Start practising")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /talk to ai/i })).toBeInTheDocument();
  });
});

describe("ComingSoonSheet", () => {
  it("closes on the Got it button and on Escape", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    const { rerender } = render(
      <ComingSoonSheet title="Soon" description="Not yet" onClose={onClose} />
    );

    await user.click(screen.getByRole("button", { name: /got it/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<ComingSoonSheet title="Soon" description="Not yet" onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("Toast", () => {
  const Trigger = () => {
    const { showToast } = useToast();
    return <button onClick={() => showToast("Profile updated")}>fire</button>;
  };

  it("shows a message and hides it again", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );

    await user.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Profile updated")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByText("Profile updated")).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});

describe("english data helpers", () => {
  it("gives every level a plain-English description", () => {
    expect(levelLabel("A1")).toBe("Beginner");
    expect(levelLabel("C2")).toBe("Fluent");
  });

  it("maps goals to friendly labels", () => {
    expect(goalLabel("job")).toBe("Work");
    expect(goalLabel("unknown")).toBe("");
  });

  it("returns a stable topic with exactly three phrases for a given day", () => {
    const topic = topicOfTheDay(new Date("2026-10-24T09:00:00Z"));
    const sameDay = topicOfTheDay(new Date("2026-10-24T21:00:00Z"));

    expect(topic.phrases).toHaveLength(3);
    expect(topic.title).toBe(sameDay.title);
  });
});
