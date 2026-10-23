import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import api from "../../src/api/axios";
import {
  register,
  login,
  logout,
  refreshToken,
  getMyProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
} from "../../src/services/auth.service"; 


jest.mock("../../src/api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn<(...args: any[]) => Promise<any>>(),
    get: jest.fn<(...args: any[]) => Promise<any>>(),
    put: jest.fn<(...args: any[]) => Promise<any>>(),
    patch: jest.fn<(...args: any[]) => Promise<any>>(),
    delete: jest.fn<(...args: any[]) => Promise<any>>(),
  },
}));

describe("Auth API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("register calls POST /auth/register with correct payload", async () => {
    const mockData = {
      name: "John Doe",
      username: "johndoe",
      email: "john@example.com",
      password: "password123",
    };
    const mockResponse = { data: { message: "User registered successfully" } };
    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await register(mockData);

    expect(api.post).toHaveBeenCalledWith("/auth/register", mockData);
    expect(result).toEqual(mockResponse.data);
  });

  it("login calls POST /auth/login with credentials", async () => {
    const mockCredentials = {
      login: "johndoe",
      password: "password123",
    };
    const mockResponse = { data: { token: "fake-jwt-token" } };
    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await login(mockCredentials);

    expect(api.post).toHaveBeenCalledWith("/auth/login", mockCredentials);
    expect(result).toEqual(mockResponse.data);
  });

  it("logout calls POST /auth/logout", async () => {
    const mockResponse = { data: { message: "Logged out successfully" } };
    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await logout();

    expect(api.post).toHaveBeenCalledWith("/auth/logout");
    expect(result).toEqual(mockResponse.data);
  });

  it("refreshToken calls POST /auth/refresh-token", async () => {
    const mockResponse = { data: { accessToken: "new-access-token" } };
    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await refreshToken();

    expect(api.post).toHaveBeenCalledWith("/auth/refresh-token");
    expect(result).toEqual(mockResponse.data);
  });


  it("getMyProfile calls GET /auth/me", async () => {
    const mockResponse = { data: { user: { _id: "u123", name: "John Doe" } } };
    (api.get as jest.MockedFunction<typeof api.get>).mockResolvedValue(mockResponse);

    const result = await getMyProfile();

    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(result).toEqual(mockResponse.data);
  });

  it("updateProfile calls PUT /auth/update-profile with FormData and multipart headers", async () => {
    const formData = new FormData();
    formData.append("name", "John Updated");

    const mockResponse = { data: { message: "Profile updated successfully" } };
    (api.put as jest.MockedFunction<typeof api.put>).mockResolvedValue(mockResponse);

    const result = await updateProfile(formData);

    expect(api.put).toHaveBeenCalledWith(
      "/auth/update-profile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    expect(result).toEqual(mockResponse.data);
  });


  it("changePassword calls PATCH /auth/change-password with payload", async () => {
    const mockPayload = {
      currentPassword: "oldPassword123",
      newPassword: "newPassword123",
    };
    const mockResponse = { data: { message: "Password updated successfully" } };
    (api.patch as jest.MockedFunction<typeof api.patch>).mockResolvedValue(mockResponse);

    const result = await changePassword(mockPayload);

    expect(api.patch).toHaveBeenCalledWith("/auth/change-password", mockPayload);
    expect(result).toEqual(mockResponse.data);
  });

  it("forgotPassword calls POST /auth/forgot-password with email object", async () => {
    const email = "john@example.com";
    const mockResponse = { data: { message: "OTP sent to email" } };
    (api.post as jest.MockedFunction<typeof api.post>).mockResolvedValue(mockResponse);

    const result = await forgotPassword(email);

    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", { email });
    expect(result).toEqual(mockResponse.data);
  });

  it("resetPassword calls PATCH /auth/reset-password with payload", async () => {
    const mockPayload = {
      email: "john@example.com",
      otp: "123456",
      newPassword: "newPassword123",
    };
    const mockResponse = { data: { message: "Password reset successfully" } };
    (api.patch as jest.MockedFunction<typeof api.patch>).mockResolvedValue(mockResponse);

    const result = await resetPassword(mockPayload);

    expect(api.patch).toHaveBeenCalledWith("/auth/reset-password", mockPayload);
    expect(result).toEqual(mockResponse.data);
  });

  it("deleteAccount calls DELETE /auth/delete-account", async () => {
    const mockResponse = { data: { message: "Account deleted successfully" } };
    (api.delete as jest.MockedFunction<typeof api.delete>).mockResolvedValue(mockResponse);

    const result = await deleteAccount();

    expect(api.delete).toHaveBeenCalledWith("/auth/delete-account");
    expect(result).toEqual(mockResponse.data);
  });
});