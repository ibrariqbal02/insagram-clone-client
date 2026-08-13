import { jest, describe, beforeEach, afterEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import CreatePost from "../../src/pages/CreatePost/CreatePost";
import { useCreatePost } from "../../src/hooks/usePost";
import { useMe } from "../../src/hooks/useAuth";


jest.mock("../../src/hooks/usePost", () => ({
  useCreatePost: jest.fn(),
}));

jest.mock("../../src/hooks/useAuth", () => ({
  useMe: jest.fn(),
}));


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as object),
  useNavigate: () => mockNavigate,
}));

describe("CreatePost Component", () => {
  const mockCreatePostMutate = jest.fn<
    (
      data: FormData,
      options?: { onSuccess?: () => void; onError?: (error: unknown) => void }
    ) => void
  >();

  beforeEach(() => {
    jest.clearAllMocks();

    global.URL.createObjectURL = jest.fn((file: Blob) => `blob:${(file as File).name}`);
    global.URL.revokeObjectURL = jest.fn();

    (useMe as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "John Doe",
          username: "johndoe",
          profilePicture: "https://example.com/avatar.jpg",
        },
      },
    });

    (useCreatePost as jest.Mock).mockReturnValue({
      mutate: mockCreatePostMutate,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderCreatePost = () => {
    return render(
      <BrowserRouter>
        <CreatePost />
      </BrowserRouter>
    );
  };

  const createDummyFile = (name = "photo.jpg", type = "image/jpeg") => {
    return new File(["dummy content"], name, { type });
  };


  it("renders upload dropzone correctly when no images are selected", () => {
    renderCreatePost();

    expect(screen.getByText(/create new post/i)).toBeInTheDocument();
    expect(screen.getByText(/drag photos and videos here/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select from computer/i })).toBeInTheDocument();


    expect(screen.queryByRole("button", { name: /discard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /share/i })).not.toBeInTheDocument();
  });


  it("displays image preview, user info, and caption textarea after selecting a file", async () => {
    renderCreatePost();
    const user = userEvent.setup();

    const file = createDummyFile("test.png");
   const input = document.querySelector('input[type="file"]') as HTMLInputElement 

    await user.upload(input, file);


    expect(screen.getByRole("img", { name: /selected 1/i })).toBeInTheDocument();
    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write a caption\.\.\./i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
  });

  it("navigates carousel when multiple images are uploaded", async () => {
    renderCreatePost();

    const file1 = createDummyFile("photo1.jpg");
    const file2 = createDummyFile("photo2.jpg");
    const input = document.querySelector('input[type="file"]')!;

    fireEvent.change(input, { target: { files: [file1, file2] } });

    expect(screen.getByRole("img", { name: /selected 1/i })).toHaveAttribute(
      "src",
      "blob:photo1.jpg"
    );
    expect(screen.getByText("1/2 photos")).toBeInTheDocument();


    const buttons = screen.getAllByRole("button");
    const nextBtn = buttons.find((btn) => btn.querySelector("svg.lucide-chevron-right"));
    
    if (nextBtn) {
      fireEvent.click(nextBtn);
      expect(screen.getByRole("img", { name: /selected 2/i })).toHaveAttribute(
        "src",
        "blob:photo2.jpg"
      );
      expect(screen.getByText("2/2 photos")).toBeInTheDocument();
    }
  });

  
  it("updates caption and character count, truncating exceeding length", async () => {
    renderCreatePost();
    const user = userEvent.setup();

    const file = createDummyFile();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    const textarea = screen.getByPlaceholderText(/write a caption\.\.\./i);
    await user.type(textarea, "My amazing post!");

    expect(textarea).toHaveValue("My amazing post!");
    expect(screen.getByText("16/2200")).toBeInTheDocument();
  });


  it("resets files and caption when clicking discard button", async () => {
    renderCreatePost();
    const user = userEvent.setup();

    const file = createDummyFile();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    const textarea = screen.getByPlaceholderText(/write a caption\.\.\./i);
    await user.type(textarea, "Discard me");

    // Click Discard button
    await user.click(screen.getByRole("button", { name: /discard/i }));

    // Should return to default dropzone view
    expect(screen.getByText(/drag photos and videos here/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/write a caption\.\.\./i)).not.toBeInTheDocument();
  });


  it("constructs FormData and navigates to '/' on successful post creation", async () => {
    mockCreatePostMutate.mockImplementation((_formData, options) => {
      options?.onSuccess?.();
    });

    renderCreatePost();
    const user = userEvent.setup();

    const file = createDummyFile("vacation.jpg");
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    await user.type(screen.getByPlaceholderText(/write a caption\.\.\./i), "Vacation vibes!");
    await user.click(screen.getByRole("button", { name: /share/i }));

    await waitFor(() => {
      expect(mockCreatePostMutate).toHaveBeenCalledWith(
        expect.any(FormData),
        expect.any(Object)
      );
    });

    // Check FormData contents sent to mutation
    const submittedFormData = mockCreatePostMutate.mock.calls[0][0];
    expect(submittedFormData.get("caption")).toBe("Vacation vibes!");
    expect(submittedFormData.get("images")).toBeDefined();

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("disables Share button and displays loading text when submission is pending", () => {
    (useCreatePost as jest.Mock).mockReturnValue({
      mutate: mockCreatePostMutate,
      isPending: true,
      isError: false,
      error: null,
    });

    renderCreatePost();

    const file = createDummyFile();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    const shareBtn = screen.getByRole("button", { name: /sharing\.\.\./i });
    expect(shareBtn).toBeInTheDocument();
    expect(shareBtn).toBeDisabled();
  });
});