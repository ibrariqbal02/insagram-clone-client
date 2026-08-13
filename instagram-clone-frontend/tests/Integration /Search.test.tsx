import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Search from "../../src/pages/Search/Search";
import { useSearchPosts, useSearchUsers } from "../../src/hooks/useSearch";

// 1. Mock search hooks
jest.mock("../../src/hooks/useSearch", () => ({
  useSearchUsers: jest.fn(),
  useSearchPosts: jest.fn(),
}));

// 2. Mock PostDetailsModal organism to isolate Search page testing
jest.mock("../../src/components/organisms/PostDetailsModal", () => {
  return function MockPostDetailsModal({
    postId,
    onClose,
  }: {
    postId: string;
    onClose: () => void;
  }) {
    return (
      <div data-testid="post-details-modal">
        Post Details for ID: {postId}
        <button data-testid="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

describe("Search Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSearch = () => {
    return render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    );
  };

  /* ==========================================
     1. Initial / Blank Search Query
  ========================================== */
  it("renders search input and blank state prompt when no keyword is entered", () => {
    (useSearchUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    (useSearchPosts as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    renderSearch();

    expect(screen.getByRole("heading", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search posts or users\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/type something to search\./i)).toBeInTheDocument();
  });

  /* ==========================================
     2. Loading States
  ========================================== */
  it("renders loading indicators while user and post queries are fetching", async () => {
    (useSearchUsers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (useSearchPosts as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderSearch();
    const user = userEvent.setup();

    // Enter a search term to reveal result sections
    const input = screen.getByPlaceholderText(/search posts or users\.\.\./i);
    await user.type(input, "test query");

    expect(screen.getAllByText(/loading\.\.\./i)).toHaveLength(2);
  });

  /* ==========================================
     3. Empty Search Results
  ========================================== */
  it("renders empty messages when queries yield no user or post matches", async () => {
    (useSearchUsers as jest.Mock).mockReturnValue({
      data: { users: [] },
      isLoading: false,
    });
    (useSearchPosts as jest.Mock).mockReturnValue({
      data: { posts: [] },
      isLoading: false,
    });

    renderSearch();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search posts or users\.\.\./i);
    await user.type(input, "nonexistent");

    expect(screen.getByText(/no users found\./i)).toBeInTheDocument();
    expect(screen.getByText(/no posts found\./i)).toBeInTheDocument();
  });

  /* ==========================================
     4. Rendering Users & Posts
  ========================================== */
  it("renders user result links and post cards with owner and image data", async () => {
    (useSearchUsers as jest.Mock).mockReturnValue({
      data: {
        users: [
          {
            _id: "user-1",
            name: "John Doe",
            username: "johndoe",
            profilePicture: "https://example.com/john.jpg",
          },
        ],
      },
      isLoading: false,
    });

    (useSearchPosts as jest.Mock).mockReturnValue({
      data: {
        posts: [
          {
            _id: "post-1",
            caption: "Awesome sunset",
            images: [{ url: "https://example.com/sunset.jpg" }],
            owner: { username: "johndoe" },
          },
        ],
      },
      isLoading: false,
    });

    renderSearch();
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/search posts or users\.\.\./i);
    await user.type(input, "john");

    // Verify user profile link using flexible accessible name regex
    const userLink = screen.getByRole("link", { name: /john doe.*@\s*johndoe/i });
    expect(userLink).toBeInTheDocument();
    expect(userLink).toHaveAttribute("href", "/profile/user-1");

    // Verify post card title and image
    expect(screen.getByText("Awesome sunset")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Awesome sunset" })).toHaveAttribute(
      "src",
      "https://example.com/sunset.jpg"
    );

    // Verify username handles rendered in both Users and Posts sections
    const handles = screen.getAllByText(/@\s*johndoe/i);
    expect(handles.length).toBe(2);
  });

  /* ==========================================
     5. Post Details Modal Interaction
  ========================================== */
  it("opens PostDetailsModal when clicking a post card and closes it on modal action", async () => {
    const user = userEvent.setup();

    (useSearchUsers as jest.Mock).mockReturnValue({
      data: { users: [] },
      isLoading: false,
    });

    (useSearchPosts as jest.Mock).mockReturnValue({
      data: {
        posts: [
          {
            _id: "post-99",
            caption: "Modal Test Post",
            images: [],
            owner: { username: "testuser" },
          },
        ],
      },
      isLoading: false,
    });

    renderSearch();

    const input = screen.getByPlaceholderText(/search posts or users\.\.\./i);
    await user.type(input, "Modal");

    // Ensure modal is initially closed
    expect(screen.queryByTestId("post-details-modal")).not.toBeInTheDocument();

    // Click the post card button
    await user.click(screen.getByRole("button", { name: /modal test post/i }));

    // Verify modal is open with target postId
    expect(screen.getByTestId("post-details-modal")).toHaveTextContent(
      "Post Details for ID: post-99"
    );

    // Close modal
    await user.click(screen.getByTestId("close-modal-btn"));
    expect(screen.queryByTestId("post-details-modal")).not.toBeInTheDocument();
  });
});