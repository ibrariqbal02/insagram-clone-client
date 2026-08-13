import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Home from "../../src/pages/Home/Home";
import { useFeed } from "../../src/hooks/useFeed";


jest.mock("../../src/hooks/useFeed", () => ({
  useFeed: jest.fn(),
}));

jest.mock("../../src/components/organisms/PostCard", () => {
  return function MockPostCard({ post }: { post: { _id: string; content?: string } }) {
    return <div data-testid={`post-card-${post._id}`}>Post Card: {post._id}</div>;
  };
});

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderHome = () => {
    return render(<Home />);
  };

  it("renders loading header when feed data is loading", () => {
    (useFeed as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderHome();

    expect(screen.getByRole("heading", { name: /loading\.\.\./i })).toBeInTheDocument();
  });


  it("renders a list of PostCard components when feed data is loaded", () => {
    const mockFeedData = {
      posts: [
        { _id: "post-1", content: "First post content" },
        { _id: "post-2", content: "Second post content" },
      ],
    };

    (useFeed as jest.Mock).mockReturnValue({
      data: mockFeedData,
      isLoading: false,
    });

    renderHome();

   
    expect(screen.queryByRole("heading", { name: /loading\.\.\./i })).not.toBeInTheDocument();


    expect(screen.getByTestId("post-card-post-1")).toBeInTheDocument();
    expect(screen.getByTestId("post-card-post-2")).toBeInTheDocument();
  });

  
  it("renders container cleanly when feed has no posts", () => {
    (useFeed as jest.Mock).mockReturnValue({
      data: { posts: [] },
      isLoading: false,
    });

    renderHome();

    expect(screen.queryByRole("heading", { name: /loading\.\.\./i })).not.toBeInTheDocument();
    expect(screen.queryByTestId(/post-card/i)).not.toBeInTheDocument();
  });

  it("renders container cleanly when feed data is undefined", () => {
    (useFeed as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    renderHome();

    expect(screen.queryByRole("heading", { name: /loading\.\.\./i })).not.toBeInTheDocument();
    expect(screen.queryByTestId(/post-card/i)).not.toBeInTheDocument();
  });
});