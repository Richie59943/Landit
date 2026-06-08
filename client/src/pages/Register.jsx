import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api"; // this is out Axios calling the API
import { isAuthenticated } from "../utils/auth";
import LoadingSpinner from "../components/LoadingSpinner"; // loading spinner component

const Register = () => {
  const [email, setEmail] = useState(""); // users email input
  const [password, setPassword] = useState(""); // users password input
  const [error, setError] = useState(""); // to store any error
  const navigate = useNavigate(); // hook for redirecting after successfull process
  const [remember, setRemember] = useState(false); // "Remember for 30 days" checkbox
  const [loading, setLoading] = useState(false); // loading state

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard"); // prevents acces if logged in already
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault(); // prevents the pafe from reloading after a subimit

    try {
      setError("");
      setLoading(true); // start loading
      // register the user by sending their email and pass word to the backend
      await API.post("/auth/register", { email, password });

      // log the user in automatically
      const res = await API.post("/auth/login", { email, password });

      //save the token from JWT and the user id in local storage so we can use it later
      localStorage.setItem("token", res.data.token); // saves the jwt token
      localStorage.setItem("userId", res.data.userId); // saves user id

      //edirect the user to our dashboard after signin in
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error;", err);
      // if theres a error (user already exist)
      const msg = err.response?.data?.message || "Registration Failed";
      setError(msg);
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
            Create an Account!
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6 dark:text-slate-400">
            Please enter your details.
          </p>

          {/* Login form */}
          <form onSubmit={handleRegister} className="space-y-4">
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
                  focus:ring-2 focus:ring-green-500 focus:border-green-500
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
                  focus:ring-2 focus:ring-green-500 focus:border-green-500
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
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Remember for 30 days</span>
              </label>
            </div>

            {/* Error message (if any) */}
            {error && (
              <p
                role="alert"
                className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              >
                {error}
              </p>
            )}

            {/* Primary Register button */}
            <button
              type="submit"
              disabled={loading} // disable button while loading
              aria-busy={loading}
              className={` w-full mt-1
                rounded-lg
                ${loading ? "bg-green-400" : "bg-green-500 hover:bg-green-700"}
                text-white
                text-sm font-semibold
                py-2.5
                shadow-md shadow-green-300/20
                transition-colors
              disabled:cursor-not-allowed`}
            >
              {loading ? (
                <LoadingSpinner text="Registering..." />
              ) : (
                "Register"
              )}
            </button>
          </form>

          {/* Footer text below form */}
          <p className="mt-5 text-center text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              className="text-green-400 hover:text-green-700 font-medium"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
