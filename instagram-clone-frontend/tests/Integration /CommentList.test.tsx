import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentList from "../../src/components/organisms/CommentList";
import { useComments, useCreateComment } from "../../src/hooks/useComment";

// 1. Mock Custom Hooks
jest.mock("../../src/hooks/useComment", () => ({
  useComments: jest.fn(),
  useCreateComment: jest.fn(),
}));

// 2. Mock CommentCard child component to isolate list logic
jest.mock("../../src/components/organisms/CommentCard", () => {
  return function MockCommentCard({
    comment,
    replies,
  }: {
    comment: { _id: string; text: string };
    replies: any[];
  }) {
    return (
      <div data-testid={`comment-card-${comment._id}`}>
        <span>{comment.text}</span>
        <span data-testid={`replies-count-${comment._id}`}>
          Replies: {replies.length}
        </span>
      </div>
    );
  };
});

describe("CommentList Component", () => {
  const mockCreateMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useCreateComment as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
  });

  /* ==========================================
     1. Loading & Empty States
  ========================================== */
  it("renders loading message while fetching comments", () => {
    (useComments as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<CommentList postId="post-123" />);

    expect(screen.getByText(/loading comments\.\.\./i)).toBeInTheDocument();
  });

  it("renders empty state placeholder when root comments are empty", () => {
    (useComments as jest.Mock).mockReturnValue({
      data: { comments: [] },
      isLoading: false,
    });

    render(<CommentList postId="post-123" />);

    expect(screen.getByText(/no comments yet\./i)).toBeInTheDocument();
  });

  /* ==========================================
     2. Rendering & Grouping Parent/Child Comments
  ========================================== */
  it("organizes root comments and pairs replies to parent ID", () => {
    (useComments as jest.Mock).mockReturnValue({
      data: {
        comments: [
          { _id: "c1", text: "Root Comment 1", parentComment: null },
          { _id: "c2", text: "Root Comment 2", parentComment: null },
          { _id: "r1", text: "Reply to C1", parentComment: "c1" },
          { _id: "r2", text: "Another Reply to C1", parentComment: { _id: "c1" } },
        ],
      },
      isLoading: false,
    });

    render(<CommentList postId="post-123" currentUserId="user-me" />);

    // Should render two root comment cards
    expect(screen.getByTestId("comment-card-c1")).toBeInTheDocument();
    expect(screen.getByTestId("comment-card-c2")).toBeInTheDocument();

    // Verify replies grouping logic
    expect(screen.getByTestId("replies-count-c1")).toHaveTextContent("Replies: 2");
    expect(screen.getByTestId("replies-count-c2")).toHaveTextContent("Replies: 0");
  });

  /* ==========================================
     3. Comment Creation
  ========================================== */
  it("submits root comment on send button click and clears input", async () => {
    const user = userEvent.setup();

    (useComments as jest.Mock).mockReturnValue({
      data: { comments: [] },
      isLoading: false,
    });

    mockCreateMutate.mockImplementation((_params: any, options: any) => {
      options?.onSuccess?.();
    });

    render(<CommentList postId="post-123" />);

    const input = screen.getByPlaceholderText(/write a comment\.\.\./i);
    await user.type(input, "New top-level comment");

    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { postId: "post-123", text: "New top-level comment" },
      expect.any(Object)
    );

    // Form input should reset
    expect(input).toHaveValue("");
  });

  it("submits comment when user presses Enter key", async () => {
    const user = userEvent.setup();

    (useComments as jest.Mock).mockReturnValue({
      data: { comments: [] },
      isLoading: false,
    });

    render(<CommentList postId="post-123" />);

    const input = screen.getByPlaceholderText(/write a comment\.\.\./i);
    await user.type(input, "Enter key submit{enter}");

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { postId: "post-123", text: "Enter key submit" },
      expect.any(Object)
    );
  });
});