import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenStatus, setTokenStatus] = useState("checking");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setTokenStatus("checking");
        setError("");
        await API.get(`/auth/reset-password/${token}`);
        setTokenStatus("valid");
      } catch (err) {
        setTokenStatus("invalid");
        setError(
          err.response?.data?.message ||
            "Password reset link is invalid or expired."
        );
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.post(`/auth/reset-password/${token}`, {
        password,
      });

      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:px-8 sm:py-10">
        <h1 className="text-center text-2xl font-bold sm:text-3xl">
          Create a new password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400">
          Choose a new password with at least 6 characters.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              minLength="6"
              required
              disabled={tokenStatus !== "valid"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              minLength="6"
              required
              disabled={tokenStatus !== "valid"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || tokenStatus !== "valid"}
            aria-busy={loading || tokenStatus === "checking"}
            className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-300/20 transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          >
            {tokenStatus === "checking" ? (
              <LoadingSpinner text="Checking link..." />
            ) : loading ? (
              <LoadingSpinner text="Resetting..." />
            ) : (
              "Reset password"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
          Need a new link?{" "}
          <Link
            to="/forgot-password"
            className="font-medium text-sky-500 hover:text-sky-700"
          >
            Request one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
