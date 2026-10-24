import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../organisms/Navbar";
import Sidebar from "../organisms/Sidebar";

/**
 * App shell: bottom tab bar below 768px, fixed sidebar from 768px up.
 */
const MainLayout = () => {
  const location = useLocation();
  const isMessages = location.pathname.startsWith("/messages");

  return (
    <div className="min-h-[100dvh] md:h-[100dvh] flex flex-col bg-white dark:bg-black md:bg-gray-50 md:dark:bg-neutral-950">
      {/* Mobile top bar — hidden inside a conversation so the chat gets the height */}
      {!isMessages && <Navbar />}

      <Sidebar />

      <main
        className={`
          flex-1 min-h-0 md:ml-[245px]
          ${
            isMessages
              ? "overflow-hidden pb-tab-bar md:pb-0 md:p-6"
              : "overflow-y-auto pb-tab-bar md:pb-6 md:px-8 md:py-0"
          }
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
