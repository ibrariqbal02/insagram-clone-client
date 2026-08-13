import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../../src/routes/ProtectedRoute";
import { useMe } from "../../src/hooks/useAuth";

// 1. Mock custom auth hook
jest.mock("../../src/hooks/useAuth", () => ({
  useMe: jest.fn(),
}));

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (initialEntries = ["/protected"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          {/* Mock public login route */}
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />

          {/* Protected route wrap */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/protected"
              element={<div data-testid="protected-content">Protected Content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  /* ==========================================
     1. Loading State
  ========================================== */
  it("renders loading indicator while authentication check is in progress", () => {
    (useMe as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithRouter();

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });

  /* ==========================================
     2. Unauthenticated / Error Redirects
  ========================================== */
  it("redirects to /login when query returns an error", () => {
    (useMe as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithRouter();

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects to /login when user object is missing from response", () => {
    (useMe as jest.Mock).mockReturnValue({
      data: { user: null },
      isLoading: false,
      isError: false,
    });

    renderWithRouter();

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  /* ==========================================
     3. Authenticated Access
  ========================================== */
  it("renders nested Outlet child route when user is authenticated", () => {
    (useMe as jest.Mock).mockReturnValue({
      data: {
        user: {
          _id: "user-123",
          username: "johndoe",
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithRouter();

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("login-page")).not.toBeInTheDocument();
  });
});