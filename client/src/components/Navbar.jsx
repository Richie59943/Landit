import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { ThemeContext } from "../context/theme";

const Navbar = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext); //gets the dark mode state
  const navigate = useNavigate();

  // Handle logout by clearing localStorage and redirecting
  const handleLogout = () => {
    localStorage.removeItem("token"); // remove saved token
    localStorage.removeItem("userId"); // optional
    navigate("/"); // send user back to login
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between">
        {/* App logo/title */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-slate-950 dark:text-white"
        >
          Landit
        </Link>

        {/* Right side navigation links */}
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            className="rounded-full border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
          >
            {darkMode ? "Light" : "Dark"}
          </button>

          {isAuthenticated() ? (
            //  If logged in, show Dashboard and Logout
            <>
              <Link
                to="/dashboard"
                className="font-medium text-slate-700 transition hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="font-semibold text-red-600 transition hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
              >
                Logout
              </button>
            </>
          ) : (
            //  If not logged in, show Login and Register
            <>
              <Link
                to="/login"
                className="font-medium text-slate-700 transition hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-3 py-1.5 font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
