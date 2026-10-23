import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "../../src/pages/Login/Login";
import { useLogin } from "../../src/hooks/useAuth";


jest.mock("../../src/hooks/useAuth", () => ({
  useLogin: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

describe("Login Component", () => {
  const mockMutate = jest.fn<
    (data: unknown, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => void
  >();

  beforeEach(() => {
    jest.clearAllMocks();

    (useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };


  it("renders heading, login form fields, buttons, and routing links", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByText(/login to your account/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /forgot password\?/i })).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/register");
  });


  it("displays validation error messages when submitting empty input fields", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/email or username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    expect(mockMutate).not.toHaveBeenCalled();
  });


  it("submits user credentials and navigates to root page '/' on success", async () => {
    mockMutate.mockImplementation((_data, options) => {
      options?.onSuccess?.();
    });

    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/email or username/i), "johndoe");
    await user.type(screen.getByPlaceholderText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          login: "johndoe",
          password: "password123",
        },
        expect.any(Object)
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("disables submit button and displays loading text when login is pending", () => {
    (useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });

    renderLogin();

    const submitBtn = screen.getByRole("button", { name: /logging in.../i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("displays server error message when login fails with invalid credentials", () => {
    const axiosError = new AxiosError("Request failed");
    axiosError.response = {
      data: { message: "Invalid credentials" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: axiosError.config as InternalAxiosRequestConfig,
    };

    (useLogin as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: axiosError,
    });

    renderLogin();

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});