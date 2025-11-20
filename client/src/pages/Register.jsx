import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api"; // this is out Axios calling the API
import { isAuthenticated } from "../utils/auth";

const Register = () => {
  const [email, setEmail] = useState(""); // users email input
  const [password, setPassword] = useState(""); // users password input
  const [error, setError] = useState(""); // to store any error
  const navigate = useNavigate(); // hook for redirecting after successfull process
  const [remember, setRemember] = useState(false); // "Remember for 30 days" checkbox

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/dashboard"); // prevents acces if logged in already
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault(); // prevents the pafe from reloading after a subimit

    try {
      // register the user by sending their email and pass word to the backend
      await API.post("/auth/register", { email, password });

      // log the user in automatically
      const res = await API.post("/auth/login", { email, password });

      //save the token from JWT and the user id in local storage so we can use it later
      localStorage.setItem("token", res.data.token); // saves the jwt token
      localStorage.setItem("userID", res.data.userID); // saves user id

      //edirect the user to our dashboard after signin in
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error;", err);
      // if theres a error (user already exist)
      const msg = err.response?.data?.message || "Registration Failed";
      setError(msg);
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center      /* center card on screen */
        bg-gray-50                            /* soft page background */
        text-gray-900
      "
    >
      {/* Outer wrapper so we can put a subtle grid behind the card */}
      <div className="relative w-full max-w-md px-4 sm:px-0">
        {/* Actual white card */}
        <div
          className="
            relative                            /* above grid background */
            bg-white
            rounded-3xl
            shadow-xl
            border border-gray-100
            px-6 sm:px-8 py-8 sm:py-10
          "
        >
          {/* Small icon at the top (you can replace with your own logo later) */}

          {/* Title + subtitle */}
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-1">
            Create an Account!
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please enter your details.
          </p>

          {/* Login form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="
                  w-full
                  rounded-lg
                  border border-gray-300
                  px-3 py-2.5
                  text-sm
                  focus:outline-none
                  focus:ring-2 focus:ring-green-500 focus:border-green-500
                  placeholder:text-gray-400
                "
              />
            </div>

            {/* Remember + forgot password row */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Remember for 30 days</span>
              </label>

              <button
                type="button"
                className="text-green-500/90 hover:text-green-700 font-medium"
                onClick={() => {
                  // right now this does nothing
                  // later you can navigate to a /forgot-password route
                  console.log("Forgot password clicked");
                }}
              >
                Forgot password
              </button>
            </div>

            {/* Error message (if any) */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Primary Register button */}
            <button
              type="submit"
              className="
                w-full
                mt-1
                rounded-lg
                bg-green-500 hover:bg-green-700
                text-white
                text-sm font-semibold
                py-2.5
                shadow-md shadow-green-500/20
                transition-colors
              "
            >
              Register
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400 my-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google sign-in button (UI only right now) */}
            <button
              type="button"
              className="
                w-full
                border border-gray-300
                rounded-lg
                py-2.5
                flex items-center justify-center
                gap-2
                text-sm font-medium
                bg-white
                hover:bg-gray-50
              "
              onClick={() => {
                console.log("Google sign in clicked");
                // later you'll wire this up to real Google OAuth
              }}
            >
              {/* Simple G logo circle */}
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-200">
                <span className="text-xs font-bold text-[#4285F4]">G</span>
              </span>
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Footer text below form */}
          <p className="mt-5 text-center text-xs sm:text-sm text-gray-500">
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
