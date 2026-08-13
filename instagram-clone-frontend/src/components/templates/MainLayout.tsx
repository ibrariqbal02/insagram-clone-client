import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../organisms/Navbar";
import Sidebar from "../organisms/Sidebar";

const MainLayout = () => {
  const location = useLocation();
  const isMessages = location.pathname.startsWith("/messages");

  return (
    /*
     * Root: fixed viewport height so every child can reliably use h-full.
     * flex-col on mobile (navbar on top, then content)
     * On desktop the sidebar is position:fixed so we only need the left margin.
     */
    <div className="h-[100dvh] flex flex-col bg-gray-50">

      {/* Mobile/tablet top bar — hidden on lg+ via Navbar's own lg:hidden */}
      <Navbar />

      {/* Fixed sidebar — outside the flex flow, just needs z-index */}
      <Sidebar />

      {/*
        <main> fills all remaining height.

        Messages route:
          - overflow-hidden  →  let ChatWindow / ConversationList own their scrolling
          - h-full           →  gives Messages a real pixel height to inherit
          - no padding       →  chat fills edge-to-edge

        All other routes:
          - overflow-y-auto  →  page scrolls normally
          - padding + max-width for readability
      */}
      <main
        className={`
          flex-1 min-h-0
          transition-[margin] duration-200
          ${isMessages
            ? "overflow-hidden lg:ml-[72px]"
            : "overflow-y-auto lg:ml-[245px] px-4 lg:px-8 py-6 pb-24 lg:pb-6"
          }
        `}
      >
        {isMessages ? (
          <Outlet />
        ) : (
          <div className="max-w-2xl mx-auto">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default MainLayout;
