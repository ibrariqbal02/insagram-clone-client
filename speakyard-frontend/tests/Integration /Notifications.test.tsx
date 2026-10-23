import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Notifications from "../../src/pages/Notifications/Notifications";
import {
  useDeleteNotification,
  useMarkNotificationAsRead,
  useNotifications,
} from "../../src/hooks/useNotification";


jest.mock("../../src/hooks/useNotification", () => ({
  useNotifications: jest.fn(),
  useMarkNotificationAsRead: jest.fn(),
  useDeleteNotification: jest.fn(),
}));


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));


jest.mock("../../src/components/organisms/NotificationCard", () => {
  return function MockNotificationCard({
    notification,
    onDelete,
    onClick,
  }: {
    notification: { _id: string; type: string };
    onDelete: () => void;
    onClick: () => void;
  }) {
    return (
      <div data-testid={`notification-card-${notification._id}`}>
        <span>Type: {notification.type}</span>
        <button data-testid={`delete-btn-${notification._id}`} onClick={onDelete}>
          Delete
        </button>
        <button data-testid={`click-btn-${notification._id}`} onClick={onClick}>
          Click Notification
        </button>
      </div>
    );
  };
});

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

describe("Notifications Component", () => {
  const mockMarkReadMutate = jest.fn();
  const mockDeleteMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useMarkNotificationAsRead as jest.Mock).mockReturnValue({
      mutate: mockMarkReadMutate,
    });

    (useDeleteNotification as jest.Mock).mockReturnValue({
      mutate: mockDeleteMutate,
    });
  });

  const renderNotifications = () => {
    return render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>
    );
  };


  it("renders loading message when notifications are being fetched", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderNotifications();

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });

  it("renders empty state message when notification list is empty", () => {
    (useNotifications as jest.Mock).mockReturnValue({
      data: { notifications: [] },
      isLoading: false,
    });

    renderNotifications();

    expect(screen.getByRole("heading", { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText(/no notifications yet\./i)).toBeInTheDocument();
  });

  it("renders notification cards and triggers delete mutation on delete click", async () => {
    const user = userEvent.setup();
    (useNotifications as jest.Mock).mockReturnValue({
      data: {
        notifications: [
          { _id: "notif-1", type: "like", isRead: true },
          { _id: "notif-2", type: "comment", isRead: true },
        ],
      },
      isLoading: false,
    });

    renderNotifications();

    expect(screen.getByTestId("notification-card-notif-1")).toBeInTheDocument();
    expect(screen.getByTestId("notification-card-notif-2")).toBeInTheDocument();

    await user.click(screen.getByTestId("delete-btn-notif-1"));

    expect(mockDeleteMutate).toHaveBeenCalledWith("notif-1");
  });


  it("marks unread notification as read and navigates to profile on follow notification", async () => {
    const user = userEvent.setup();
    (useNotifications as jest.Mock).mockReturnValue({
      data: {
        notifications: [
          {
            _id: "notif-follow",
            type: "follow",
            isRead: false,
            sender: { _id: "user-999" },
          },
        ],
      },
      isLoading: false,
    });

    renderNotifications();

    await user.click(screen.getByTestId("click-btn-notif-follow"));

    
    expect(mockMarkReadMutate).toHaveBeenCalledWith("notif-follow");
 
    expect(mockNavigate).toHaveBeenCalledWith("/profile/user-999");
  });

  it("navigates to conversation route on message notification click", async () => {
    const user = userEvent.setup();
    (useNotifications as jest.Mock).mockReturnValue({
      data: {
        notifications: [
          {
            _id: "notif-msg",
            type: "message",
            isRead: true,
            conversation: "conv-888",
          },
        ],
      },
      isLoading: false,
    });

    renderNotifications();

    await user.click(screen.getByTestId("click-btn-notif-msg"));

    expect(mockMarkReadMutate).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/messages/conv-888");
  });

  it("opens PostDetailsModal on post notification click and closes it on modal action", async () => {
    const user = userEvent.setup();
    (useNotifications as jest.Mock).mockReturnValue({
      data: {
        notifications: [
          {
            _id: "notif-post",
            type: "like",
            isRead: true,
            post: { _id: "post-777" },
          },
        ],
      },
      isLoading: false,
    });

    renderNotifications();

    
    expect(screen.queryByTestId("post-details-modal")).not.toBeInTheDocument();

  
    await user.click(screen.getByTestId("click-btn-notif-post"));

    
    expect(screen.getByTestId("post-details-modal")).toHaveTextContent(
      "Post Details for ID: post-777"
    );


    await user.click(screen.getByTestId("close-modal-btn"));
    expect(screen.queryByTestId("post-details-modal")).not.toBeInTheDocument();
  });
});
