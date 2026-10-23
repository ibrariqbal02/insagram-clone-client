
import { jest, describe, beforeEach, it, expect, } from "@jest/globals";
import "@testing-library/jest-dom"; 
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Register from "../../src/pages/Register/Register";
import { useRegister } from "../../src/hooks/useAuth";


jest.mock("../../src/hooks/useAuth", () => ({
  useRegister: jest.fn(),
}));


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

describe("Register Component", () => {
  const mockMutate = jest.fn<
    (data: unknown, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => void
  >();

  beforeEach(() => {
    jest.clearAllMocks();


    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };




  it("renders all form elements, heading, and login link correctly", () => {
    renderRegister();

    expect(screen.getByRole("heading", { name: /instagram/i })).toBeInTheDocument();
    expect(screen.getByText(/sign up to see photos from your friends/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute("href", "/login");
  });


  it("displays validation error messages when submitting empty fields", async () => {
    renderRegister();
    const user = userEvent.setup();

    
    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(await screen.findByText(/^name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^username is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/^password is required/i)).toBeInTheDocument();

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("displays a validation error when password length is less than 8 characters", async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/full name/i), "John Doe");
    await user.type(screen.getByPlaceholderText(/username/i), "johndoe");
    await user.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "12345"); // Short password

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i)
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });


  it("calls register mutation and redirects to /login on success", async () => {
    mockMutate.mockImplementation((_data, options) => {
      options?.onSuccess?.();
    });

    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/full name/i), "John Doe");
    await user.type(screen.getByPlaceholderText(/username/i), "johndoe");
    await user.type(screen.getByPlaceholderText(/email/i), "john@example.com");
    await user.type(screen.getByPlaceholderText(/password/i), "password123");

    await user.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          name: "John Doe",
          username: "johndoe",
          email: "john@example.com",
          password: "password123",
        },
        expect.any(Object)
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });


  it("disables button and displays loading text when mutation is pending", () => {
    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    });

    renderRegister();

    const submitBtn = screen.getByRole("button", { name: /creating account.../i });
    expect(submitBtn).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it("displays server error message when registration fails", () => {
    const axiosError = new AxiosError("Request failed");
    axiosError.response = {
      data: { message: "Email already taken" },
      status: 409,
      statusText: "Conflict",
      headers: {},
      config: axiosError.config as InternalAxiosRequestConfig,
    };

    (useRegister as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: true,
      error: axiosError,
    });

    renderRegister();

    expect(screen.getByText(/email already taken/i)).toBeInTheDocument();
  });
});