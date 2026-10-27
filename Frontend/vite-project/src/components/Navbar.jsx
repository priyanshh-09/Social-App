import { Link, useNavigate } from "react-router";
import { logoutUser } from "../services/api";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.log("Logout failed:", error.message);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-base-300 bg-base-100/90 backdrop-blur-lg">
      <div className="navbar mx-auto max-w-7xl px-4 sm:px-6">
        {/* Brand */}
        <div className="flex-1">
          <Link
            to="/home"
            className="flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-lg text-white shadow-lg shadow-violet-500/20">
              S
            </span>

            <span>
              Social
              <span className="text-violet-600 dark:text-violet-400">App</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 sm:flex">
            <Link to="/home" className="btn btn-ghost btn-sm rounded-xl">
              Home
            </Link>

            <Link to="/profile" className="btn btn-ghost btn-sm rounded-xl">
              Profile
            </Link>

            <Link
              to="/notifications"
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Notifications
            </Link>
          </div>

          <ThemeToggle />

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-error btn-sm rounded-xl text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="flex justify-center gap-2 border-t border-base-300 px-2 py-2 sm:hidden">
        <Link to="/home" className="btn btn-ghost btn-sm flex-1 rounded-xl">
          Home
        </Link>

        <Link to="/profile" className="btn btn-ghost btn-sm flex-1 rounded-xl">
          Profile
        </Link>

        <Link
          to="/notifications"
          className="btn btn-ghost btn-sm flex-1 rounded-xl"
        >
          Notifications
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
