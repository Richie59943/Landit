import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";
import { ThemeContext } from "../context/ThemeContext";

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
    <nav className="bg-white dark:bg-gray-900 shadow-md px-6 py-4 flex justify-between items-center">
      {/* App logo/title */}
      <Link to="/" className="text-xl dark:text-white font-bold text-black ">
        Landit
      </Link>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="px-3 py-1 border rounded text-sm"
      >
        {darkMode ? "Light" : "Dark"}
      </button>

      {/* Right side navigation links */}
      <div className="space-x-4">
        {isAuthenticated() ? (
          //  If logged in, show Dashboard and Logout
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </>
        ) : (
          //  If not logged in, show Login and Register
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-gray-700 hover:text-blue-600">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
