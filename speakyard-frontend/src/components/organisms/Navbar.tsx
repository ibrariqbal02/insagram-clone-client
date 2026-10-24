import { Link } from "react-router-dom";
import Logo from "../atoms/Logo";

/**
 * Mobile top bar (below 768px) — just the Speakyard wordmark.
 * Navigation itself lives in the bottom tab bar.
 */
const Navbar = () => (
  <header className="sticky top-0 z-40 bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-800 md:hidden pt-safe">
    <div className="h-14 flex items-center px-4">
      <Link
        to="/"
        className="flex items-center rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label="Speakyard home"
      >
        <Logo size={28} />
      </Link>
    </div>
  </header>
);

export default Navbar;
