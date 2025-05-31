import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();

  // Handle logout by clearing localStorage and redirecting
  const handleLogout = () => {
    localStorage.removeItem('token'); // remove saved token
    localStorage.removeItem('userId'); // optional
    navigate('/'); // send user back to login
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* App logo/title */}
      <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>

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