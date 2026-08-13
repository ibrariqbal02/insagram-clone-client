import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ForgotPassword from "../../src/pages/ForgotPassword/ForgotPassword";
import { useForgotPassword, useResetPassword } from "../../src/hooks/useAuth";


jest.mock("../../src/hooks/useAuth", () => ({
  useForgotPassword: jest.fn(),
  useResetPassword: jest.fn(),
}));


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

describe("ForgotPassword Component", () => {
  const mockForgotPasswordMutate = jest.fn<
    (email: string, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => void
  >();

  const mockResetPasswordMutate = jest.fn<
    (
      data: { email: string; otp: string; newPassword: string },
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
    ) => void
  >();

  beforeEach(() => {
    jest.clearAllMocks();

    (useForgotPassword as jest.Mock).mockReturnValue({
      mutate: mockForgotPasswordMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    (useResetPassword as jest.Mock).mockReturnValue({
      mutate: mockResetPasswordMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  const renderForgotPassword = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };


  it("renders email input step correctly", () => {
    renderForgotPassword();

    expect(screen.getByRole("heading", { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByText(/enter your email and we'll send you an otp/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/login");
  });

  it("does not call mutation when submitting an empty email", async () => {
    renderForgotPassword();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /send otp/i }));

    expect(mockForgotPasswordMutate).not.toHaveBeenCalled();
  });

  it("submits email and switches to Step 2 (OTP form) on success", async () => {
    mockForgotPasswordMutate.mockImplementation((_email, options) => {
      options?.onSuccess?.();
    });

    renderForgotPassword();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    expect(mockForgotPasswordMutate).toHaveBeenCalledWith("user@example.com", expect.any(Object));


    expect(
      await screen.findByText(/enter the otp we sent you and choose a new password/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/otp/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
  });

  it("displays error message when sending OTP fails", () => {
    const axiosError = new AxiosError("Request failed");
    axiosError.response = {
      data: { message: "Account not found" },
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: axiosError.config as InternalAxiosRequestConfig,
    };

    (useForgotPassword as jest.Mock).mockReturnValue({
      mutate: mockForgotPasswordMutate,
      isPending: false,
      isError: true,
      error: axiosError,
    });

    renderForgotPassword();

    expect(screen.getByText(/account not found/i)).toBeInTheDocument();
  });


  it("submits OTP and new password and navigates to /login on success", async () => {

    mockForgotPasswordMutate.mockImplementation((_email, options) => {
      options?.onSuccess?.();
    });

    mockResetPasswordMutate.mockImplementation((_data, options) => {
      options?.onSuccess?.();
    });

    renderForgotPassword();
    const user = userEvent.setup();


    await user.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

  
    await user.type(screen.getByPlaceholderText(/otp/i), "123456");
    await user.type(screen.getByPlaceholderText(/new password/i), "newsecret123");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mockResetPasswordMutate).toHaveBeenCalledWith(
        {
          email: "user@example.com",
          otp: "123456",
          newPassword: "newsecret123",
        },
        expect.any(Object)
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("allows switching back to step 1 via 'Use a different email'", async () => {
    mockForgotPasswordMutate.mockImplementation((_email, options) => {
      options?.onSuccess?.();
    });

    renderForgotPassword();
    const user = userEvent.setup();

    // Go to step 2
    await user.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    // Click "Use a different email"
    await user.click(screen.getByRole("button", { name: /use a different email/i }));

    // Verify back on step 1
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument();
  });

  it("displays error message when password reset fails", async () => {
    mockForgotPasswordMutate.mockImplementation((_email, options) => {
      options?.onSuccess?.();
    });

    const axiosError = new AxiosError("Request failed");
    axiosError.response = {
      data: { message: "Invalid or expired OTP." },
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: axiosError.config as InternalAxiosRequestConfig,
    };

    (useResetPassword as jest.Mock).mockReturnValue({
      mutate: mockResetPasswordMutate,
      isPending: false,
      isError: true,
      error: axiosError,
    });

    renderForgotPassword();
    const user = userEvent.setup();


    await user.type(screen.getByPlaceholderText(/email/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /send otp/i }));

    expect(screen.getByText(/invalid or expired otp\./i)).toBeInTheDocument();
  });
});