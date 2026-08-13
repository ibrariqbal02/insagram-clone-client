import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentCard from "../../src/components/organisms/CommentCard";
import {
  useCreateComment,
  useDeleteComment,
  useLikeUnlikeComment,
  useUpdateComment,
} from "../../src/hooks/useComment";


jest.mock("../../src/hooks/useComment", () => ({
  useLikeUnlikeComment: jest.fn(),
  useUpdateComment: jest.fn(),
  useDeleteComment: jest.fn(),
  useCreateComment: jest.fn(),
}));

describe("CommentCard Component", () => {
  const mockLikeMutate = jest.fn();
  const mockUpdateMutate = jest.fn();
  const mockDeleteMutate = jest.fn();
  const mockCreateMutate = jest.fn();

  const sampleComment = {
    _id: "comment-1",
    text: "Great post!",
    owner: {
      _id: "user-1",
      name: "John Doe",
      username: "johndoe",
      profilePicture: "https://example.com/john.jpg",
    },
    likes: ["user-2"],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useLikeUnlikeComment as jest.Mock).mockReturnValue({
      mutate: mockLikeMutate,
    });

    (useUpdateComment as jest.Mock).mockReturnValue({
      mutate: mockUpdateMutate,
    });

    (useDeleteComment as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
    });

    (useCreateComment as jest.Mock).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });
  });

  it("renders comment info and hides owner actions for other users' comments", () => {
    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-2"
      />
    );

    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("Great post!")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // Likes count

    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();
  });

  it("renders Edit and Delete actions when currentUserId matches comment owner", () => {
    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-1"
      />
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("triggers likeUnlikeComment mutation on heart button click", async () => {
    const user = userEvent.setup();
    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-2"
      />
    );

   
    const likeBtn = screen.getByText("1").closest("button")!;
    await user.click(likeBtn);

    expect(mockLikeMutate).toHaveBeenCalledWith("comment-1");
  });

 
  it("opens edit field and submits updated text on save", async () => {
    const user = userEvent.setup();

    
    mockUpdateMutate.mockImplementation((_params: any, options: any) => {
      options?.onSuccess?.();
    });

    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-1"
      />
    );

    await user.click(screen.getByRole("button", { name: /edit/i }));

    const input = screen.getByDisplayValue("Great post!");
    await user.clear(input);
    await user.type(input, "Updated post caption!");

    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { commentId: "comment-1", text: "Updated post caption!" },
      expect.any(Object)
    );

   
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });


  it("triggers delete mutation after user confirms deletion prompt", async () => {
    const user = userEvent.setup();
    jest.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-1"
      />
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(window.confirm).toHaveBeenCalledWith("Delete this comment?");
    expect(mockDeleteMutate).toHaveBeenCalledWith("comment-1");
  });


  it("opens reply form and triggers createComment with parentComment ID", async () => {
    const user = userEvent.setup();


    mockCreateMutate.mockImplementation((_params: any, options: any) => {
      options?.onSuccess?.();
    });

    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-2"
      />
    );

    await user.click(screen.getByRole("button", { name: /reply/i }));

    const input = screen.getByPlaceholderText("Reply to johndoe...");
    await user.type(input, "Thanks!");

    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(mockCreateMutate).toHaveBeenCalledWith(
      { postId: "post-1", text: "Thanks!", parentComment: "comment-1" },
      expect.any(Object)
    );
  });

  it("renders child replies and hides reply button on child items", () => {
    const replies = [
      {
        _id: "reply-1",
        text: "Nested reply text",
        owner: {
          _id: "user-3",
          name: "Alice",
          username: "alice",
          profilePicture: "https://example.com/alice.jpg",
        },
        likes: [],
      },
    ];

    render(
      <CommentCard
        postId="post-1"
        comment={sampleComment}
        currentUserId="user-1"
        replies={replies}
      />
    );

    expect(screen.getByText("alice")).toBeInTheDocument();
    expect(screen.getByText("Nested reply text")).toBeInTheDocument();
  });
});