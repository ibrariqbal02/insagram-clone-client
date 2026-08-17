import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../organisms/Navbar";
import Sidebar from "../organisms/Sidebar";

const MainLayout = () => {
  const location    = useLocation();
  const isMessages  = location.pathname.startsWith("/messages");
  const isReels     = location.pathname.startsWith("/reels");
  const isCreatePost = location.pathname === "/create-post";

  // These pages need full-screen / edge-to-edge treatment with no padding wrapper
  const isFullScreen = isMessages || isReels;

  return (
    /*
     * Root: fixed to viewport height — 100dvh handles mobile browser
     * chrome (address bar collapsing) correctly.
     */
    <div className="h-[100dvh] flex flex-col bg-white dark:bg-black lg:bg-gray-50 dark:lg:bg-neutral-950">

      {/* Mobile/tablet top bar — hidden on lg+, also hidden on create-post / reels */}
      {!isCreatePost && !isReels && <Navbar />}

      {/* Fixed desktop sidebar — outside flex flow */}
      <Sidebar />

      {/*
        Main content area.

        Mobile:
          - No left margin (sidebar is a bottom tab bar on mobile)
          - bg-white (Instagram is white, not gray, on mobile)
          - Messages / Reels: overflow-hidden, fills to bottom including safe area
          - Other pages: overflow-y-auto, pb-tab-bar to clear the bottom bar

        Desktop (lg+):
          - Left margin matches sidebar width (245px normal, 72px collapsed)
          - Restored gray background
      */}
      <main
        className={`
          flex-1 min-h-0
          transition-[margin] duration-200
          ${isFullScreen
            ? [
                /* mobile: fill height, subtract bottom tab bar */
                "overflow-hidden pb-tab-bar lg:pb-0",
                /* desktop */ `lg:ml-[${isMessages ? "72" : "245"}px] ${isMessages ? "lg:p-6" : ""}`,
              ].join(" ")
            : [
                /* mobile */  "overflow-y-auto pb-tab-bar",
                /* desktop */ "lg:overflow-y-auto lg:pb-6 lg:ml-[245px] lg:px-8 lg:py-6",
              ].join(" ")
          }
        `}
      >
        {isFullScreen ? (
          <Outlet />
        ) : (
          /*
           * On mobile: full-width, no horizontal padding (PostCard etc. handle
           * their own edge-to-edge look). On desktop: constrained + centered.
           */
          <div className="lg:max-w-2xl lg:mx-auto lg:px-0 px-0 w-full">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
