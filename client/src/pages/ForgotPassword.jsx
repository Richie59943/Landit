import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setResetUrl("");

      const res = await API.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(res.data.message);
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to request a password reset. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:px-8 sm:py-10">
        <h1 className="text-center text-2xl font-bold sm:text-3xl">
          Reset your password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400">
          Enter your email and we will create a secure reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {message && (
            <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              {message}
            </p>
          )}

          {resetUrl && (
            <a
              href={resetUrl}
              className="block break-words rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 hover:text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200"
            >
              Development reset link: {resetUrl}
            </a>
          )}

          {error && (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-300/20 transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          >
            {loading ? <LoadingSpinner text="Sending..." /> : "Send reset link"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium text-sky-500 hover:text-sky-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
