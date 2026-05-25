// src/App.jsx

import React from "react"; // React core
import {
  BrowserRouter, // Top-level router provider
  Routes, // Wraps all your Route definitions
  Route, // Single route definition
  Navigate, // Used to redirect the user
  useLocation, // Hook to read the current URL path
} from "react-router-dom";

import Login from "./pages/Login"; // Login page
import Register from "./pages/Register"; // Register page
import Dashboard from "./pages/Dashboard"; // Main app page after login
import Navbar from "./components/Navbar"; // Top navigation bar
import LandingPage from "./pages/LandingPage"; // Public landing page

import { ThemeProvider } from "./context/ThemeContext"; // Dark/light theme context
import { isAuthenticated } from "./utils/auth"; // Helper that checks for token

// ---------------- PROTECTED ROUTE WRAPPER ----------------

// This component protects certain routes (like /dashboard).
// If the user is not logged in, it redirects them to /login instead.
const ProtectedRoute = ({ children }) => {
  const loggedIn = isAuthenticated(); // Check if token exists and is valid (your logic)

  if (!loggedIn) {
    // Not logged in: send user to /login
    return <Navigate to="/login" replace />;
  }

  // Logged in: render the protected content (for example, <Dashboard />)
  return children;
};

// ---------------- MAIN APP LAYOUT + ROUTES ----------------

// This component handles:
// 1) When to show the Navbar
// 2) Which page to render for each URL
const AppContent = () => {
  const location = useLocation(); // Gives you the current path, e.g. "/", "/login", "/dashboard"
  const loggedIn = isAuthenticated(); // Check login status

  // List of routes where we do not want to show the Navbar
  const hideNavbarOn = ["/"];

  // Decide if the Navbar should be visible:
  // - Only show it if the user is logged in
  // - And the current path is not one of the "hide" paths
  const showNavbar =
    (loggedIn ||
      location.pathname === "/login" ||
      location.pathname === "/register") &&
    !hideNavbarOn.includes(location.pathname);

  return (
    // Outer wrapper that sets the global background and text colors
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Conditionally render the Navbar only if showNavbar is true */}
      {showNavbar && <Navbar />}

      {/* Route definitions: which component to show for each path */}
      <Routes>
        {/* Public landing page - first thing users see at "/" */}
        <Route path="/" element={<LandingPage />} />

        {/* Public auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private dashboard route, wrapped in ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route: if path does not match anything above, redirect to "/" */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// ---------------- ROOT APP COMPONENT ----------------

// This sets up global providers and the router.
// ThemeProvider: provides dark/light mode context to the whole app
// BrowserRouter: enables client-side routing (URL changes without full page reload)
const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App; // Export so main.jsx can render <App />
