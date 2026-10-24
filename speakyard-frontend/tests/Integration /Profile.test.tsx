import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Profile from "../../src/pages/Profile/Profile";
import { useMyProfile, useUserProfile } from "../../src/hooks/useProfile";

jest.mock("../../src/hooks/useProfile", () => ({
  useMyProfile: jest.fn(),
  useUserProfile: jest.fn(),
}));

jest.mock("../../src/components/organisms/ProfileHeader", () => {
  return function MockProfileHeader({
    userId,
    onEditClick,
  }: {
    userId: string;
    onEditClick?: () => void;
  }) {
    return (
      <div data-testid="profile-header">
        Header for User: {userId}
        {onEditClick && (
          <button data-testid="edit-profile-btn" onClick={onEditClick}>
            Edit Profile
          </button>
        )}
      </div>
    );
  };
});

jest.mock("../../src/components/organisms/EditProfileModal", () => {
  return function MockEditProfileModal({
    user,
    onClose,
  }: {
    user: { name: string };
    onClose: () => void;
  }) {
    return (
      <div data-testid="edit-profile-modal">
        Editing user: {user.name}
        <button data-testid="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    );
  };
});

describe("Profile Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderProfile = (initialEntries = ["/profile"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe("Own Profile View", () => {
    it("renders a skeleton while fetching own profile", () => {
      (useMyProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: true });
      (useUserProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

      renderProfile(["/profile"]);

      expect(screen.queryByTestId("profile-header")).not.toBeInTheDocument();
    });

    it("renders a friendly error when own profile fails to load", () => {
      (useMyProfile as jest.Mock).mockReturnValue({ data: null, isLoading: false });
      (useUserProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

      renderProfile(["/profile"]);

      expect(screen.getByText(/couldn't load your profile/i)).toBeInTheDocument();
    });

    it("renders the learner header without a posts grid", () => {
      const mockUser = { _id: "my-user-123", name: "Jane Doe" };
      (useMyProfile as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        isLoading: false,
      });
      (useUserProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

      renderProfile(["/profile"]);

      expect(screen.getByTestId("profile-header")).toHaveTextContent(
        "Header for User: my-user-123"
      );
      expect(screen.getByTestId("edit-profile-btn")).toBeInTheDocument();
      // Posts grid was removed in the 2.3b UX pass
      expect(screen.queryByTestId("profile-posts")).not.toBeInTheDocument();
    });

    it("opens and closes EditProfileModal", async () => {
      const user = userEvent.setup();
      const mockUser = { _id: "my-user-123", name: "Jane Doe" };

      (useMyProfile as jest.Mock).mockReturnValue({
        data: { user: mockUser },
        isLoading: false,
      });
      (useUserProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });

      renderProfile(["/profile"]);

      expect(screen.queryByTestId("edit-profile-modal")).not.toBeInTheDocument();

      await user.click(screen.getByTestId("edit-profile-btn"));
      expect(screen.getByTestId("edit-profile-modal")).toHaveTextContent(
        "Editing user: Jane Doe"
      );

      await user.click(screen.getByTestId("close-modal-btn"));
      expect(screen.queryByTestId("edit-profile-modal")).not.toBeInTheDocument();
    });
  });

  describe("Other User Profile View", () => {
    it("renders 'Profile not found' when the user is missing", () => {
      (useMyProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
      (useUserProfile as jest.Mock).mockReturnValue({ data: null, isLoading: false });

      renderProfile(["/profile/user-456"]);

      expect(screen.getByText(/profile not found/i)).toBeInTheDocument();
    });

    it("renders the header for the target user with no edit button", () => {
      (useMyProfile as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
      (useUserProfile as jest.Mock).mockReturnValue({
        data: { user: { _id: "user-456", name: "John Smith" } },
        isLoading: false,
      });

      renderProfile(["/profile/user-456"]);

      expect(screen.getByTestId("profile-header")).toHaveTextContent(
        "Header for User: user-456"
      );
      expect(screen.queryByTestId("edit-profile-btn")).not.toBeInTheDocument();
    });
  });
});
