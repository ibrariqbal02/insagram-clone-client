import { jest, describe, beforeEach, it, expect } from "@jest/globals";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MainLayout from "../../src/components/templates/MainLayout";


jest.mock("../../src/components/organisms/Navbar", () => {
  return function MockNavbar() {
    return <header data-testid="mock-navbar">Navbar</header>;
  };
});

jest.mock("../../src/components/organisms/Sidebar", () => {
  return function MockSidebar() {
    return <aside data-testid="mock-sidebar">Sidebar</aside>;
  };
});

describe("MainLayout Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (initialEntries = ["/"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div data-testid="child-home-page">Home Page Content</div>} />
            <Route path="profile" element={<div data-testid="child-profile-page">Profile Page Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };


  it("renders Navbar, Sidebar, and the main container", () => {
    renderWithRouter();

    expect(screen.getByTestId("mock-navbar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });


  it("renders the index child route content inside Outlet", () => {
    renderWithRouter(["/"]);

    const mainContainer = screen.getByRole("main");
    const childContent = screen.getByTestId("child-home-page");

    expect(childContent).toBeInTheDocument();
    expect(mainContainer).toContainElement(childContent);
  });

  it("renders matching nested route content when navigating paths", () => {
    renderWithRouter(["/profile"]);

    const childContent = screen.getByTestId("child-profile-page");

    expect(childContent).toBeInTheDocument();
    expect(screen.queryByTestId("child-home-page")).not.toBeInTheDocument();
  });


  it("applies desktop sidebar margin offset and container styles to main element", () => {
    renderWithRouter();

    const mainElement = screen.getByRole("main");


    expect(mainElement).toHaveClass("lg:ml-64", "max-w-7xl", "mx-auto", "pb-24", "lg:pb-6");
  });
});