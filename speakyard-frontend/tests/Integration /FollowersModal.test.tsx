import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import FollowersModal from "../../src/components/organisms/FollowersModal";
import { useMe } from "../../src/hooks/useAuth";
import { useFollowUser } from "../../src/hooks/useFollow";
import { useFollowers, useRemoveFollower } from "../../src/hooks/useProfile";


jest.mock("../../src/hooks/useAuth", () => ({
  useMe: jest.fn(),
}));

jest.mock("../../src/hooks/useFollow", () => ({
  useFollowUser: jest.fn(),
}));

jest.mock("../../src/hooks/useProfile", () => ({
  useFollowers: jest.fn(),
  useRemoveFollower: jest.fn(),
}));

describe("FollowersModal Component", () => {
  const mockOnClose = jest.fn();
  const mockFollowMutate = jest.fn();
  const mockRemoveMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMe as jest.Mock).mockReturnValue({
      data: {
        user: {
          _id: "user-me",
          following: ["user-following-id"],
        },
      },
    });

    (useFollowUser as jest.Mock).mockReturnValue({
      mutate: mockFollowMutate,
      isPending: false,
    });

    (useRemoveFollower as jest.Mock).mockReturnValue({
      mutate: mockRemoveMutate,
      isPending: false,
    });
  });

  const renderModal = (userId = "user-other") => {
    return render(
      <BrowserRouter>
        <FollowersModal userId={userId} onClose={mockOnClose} />
      </BrowserRouter>
    );
  };


  it("renders loading message while followers are fetching", () => {
    (useFollowers as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderModal();

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });

  it("renders empty state placeholder when target has no followers", () => {
    (useFollowers as jest.Mock).mockReturnValue({
      data: { followers: [] },
      isLoading: false,
    });

    renderModal();

    expect(screen.getByText(/no followers yet\./i)).toBeInTheDocument();
  });


  it("calls onClose when clicking header close button or profile link", async () => {
    const user = userEvent.setup();
    (useFollowers as jest.Mock).mockReturnValue({
      data: {
        followers: [
          {
            _id: "user-1",
            name: "John",
            username: "john",
            profilePicture: "https://example.com/john.jpg",
          },
        ],
      },
      isLoading: false,
    });

    renderModal();

   
    const link = screen.getByRole("link", { name: /john @john/i });
    await user.click(link);
    expect(mockOnClose).toHaveBeenCalledTimes(1);


    const closeBtn = screen.getByRole("button", { name: "" }); // X icon button
    await user.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it("renders correct button label and triggers followUser mutation", async () => {
    const user = userEvent.setup();
    (useFollowers as jest.Mock).mockReturnValue({
      data: {
        followers: [
          { _id: "user-not-following", name: "Alice", username: "alice" },
          { _id: "user-following-id", name: "Bob", username: "bob" },
        ],
      },
      isLoading: false,
    });

    renderModal("user-other");

    const followBtn = screen.getByRole("button", { name: /^follow$/i });
    const followingBtn = screen.getByRole("button", { name: /^following$/i });

    expect(followBtn).toBeInTheDocument();
    expect(followingBtn).toBeInTheDocument();

    await user.click(followBtn);

    expect(mockFollowMutate).toHaveBeenCalledWith("user-not-following");
  });

  it("renders remove button only when viewing own profile and triggers removeFollower", async () => {
    const user = userEvent.setup();
    (useFollowers as jest.Mock).mockReturnValue({
      data: {
        followers: [
          { _id: "user-1", name: "John", username: "john" },
        ],
      },
      isLoading: false,
    });


    renderModal("user-me");

    const removeBtn = screen.getByRole("button", { name: /remove/i });
    expect(removeBtn).toBeInTheDocument();

    await user.click(removeBtn);
    expect(mockRemoveMutate).toHaveBeenCalledWith("user-1");
  });

  it("does not render remove button when viewing another user's profile", () => {
    (useFollowers as jest.Mock).mockReturnValue({
      data: {
        followers: [
          { _id: "user-1", name: "John", username: "john" },
        ],
      },
      isLoading: false,
    });


    renderModal("user-other");

    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });


  it("hides follow and remove buttons for logged in user item", () => {
    (useFollowers as jest.Mock).mockReturnValue({
      data: {
        followers: [
          { _id: "user-me", name: "Myself", username: "myself" },
        ],
      },
      isLoading: false,
    });

    renderModal("user-me");

    expect(screen.queryByRole("button", { name: /follow/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });
});