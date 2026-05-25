// src/pages/Login.jsx
import React, { useEffect, useState } from "react"; // React + hooks
import { useNavigate } from "react-router-dom"; // navigation after login
import API from "../utils/api"; // axios instance
import { isAuthenticated } from "../utils/auth"; // check if already logged in
import LoadingSpinner from "../components/LoadingSpinner"; // loading spinner component

const Login = () => {
  // track form fields
  const [email, setEmail] = useState(""); // email input
  const [password, setPassword] = useState(""); // password input
  const [remember, setRemember] = useState(false); // "Remember for 30 days" checkbox
  const [error, setError] = useState(""); // error message
  const [loading, setLoading] = useState(false); // loading state

  const navigate = useNavigate(); // used to redirect

  // if user is already authenticated, send them straight to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // handle the form submit
  const handleLogin = async (e) => {
    e.preventDefault(); // stop page refresh

    try {
      setLoading(true); // start loading
      // send login request to backend
      const res = await API.post("/auth/login", { email, password });

      // save token and user id to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      // if you want to use "remember" later, you could store that here
      // e.g. localStorage.setItem("rememberMe", remember ? "true" : "false");

      // redirect to dashboard on success
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "Login failed";
      setError(message); // show error to user
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center      /* center card on screen */
        bg-gray-50                            /* soft page background */
        text-gray-900
        dark:bg-slate-950
        dark:text-slate-100
      "
    >
      {/* Outer wrapper so we can put a subtle grid behind the card */}
      <div className="relative w-full max-w-md px-4 sm:px-0">
        {/* Actual white card */}
        <div
          className="
            relative                            /* above grid background */
            bg-white
            dark:bg-slate-900
            rounded-3xl
            shadow-xl
            border border-gray-100
            dark:border-slate-800
            px-6 sm:px-8 py-8 sm:py-10
          "
        >
          {/* Small icon at the top (you can replace with your own logo later) */}

          {/* Title + subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1">
            Welcome Back!
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6 dark:text-slate-400">
            Please enter your details.
          </p>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="
                  w-full
                  rounded-lg
                  border border-gray-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-100
                  px-3 py-2.5
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="
                  w-full
                  rounded-lg
                  border border-gray-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-slate-100
                  px-3 py-2.5
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-sky-500 focus:border-sky-500
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Remember row */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Remember for 30 days</span>
              </label>
            </div>

            {/* Error message (if any) */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Primary Sign in button */}
            <button
              type="submit" // button submits the form, which triggers handle login
              disabled={loading} // while loading is true, user cannot click again
              className={` w-full mt-1
                rounded-lg
                ${loading ? "bg-sky-400" : "bg-sky-500 hover:bg-sky-700"}
                text-white
                text-sm font-semibold
                py-2.5
                shadow-md shadow-sky-300/20
                transition-colors
                disabled:cursor-not-allowed // show "not-allowed" cursor when disabled
              `}
            >
              {loading ? ( // if loading is true, show spinner + text
                <LoadingSpinner text="Signing in..." />
              ) : (
                "Sign In" // otherwise just show "Sign In"
              )}
            </button>
          </form>

          {/* Footer text below form */}
          <p className="mt-5 text-center text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-sky-400 hover:text-sky-700 font-medium"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
