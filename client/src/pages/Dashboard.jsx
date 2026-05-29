// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // for redirects
import API from "../utils/api"; // axios instance for API calls
import { isAuthenticated } from "../utils/auth"; // checks if token exists
import { DndContext } from "@dnd-kit/core"; // drag-and-drop context
import JobColumn from "../components/JobColumn"; // column component for each status
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  // ---------------- STATE ----------------
  const [jobs, setJobs] = useState([]); // all jobs from backend
  const [error, setError] = useState(""); // global error message
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false); // controls modal visibility

  // form fields
  const [company, setCompany] = useState(""); // company input
  const [position, setPosition] = useState(""); // position input
  const [status, setStatus] = useState("Applied"); // default status
  const [notes, setNotes] = useState(""); // notes input
  const [maxSalary, setMaxSalary] = useState(""); // max salary input (string from input)
  const [minSalary, setMinSalary] = useState(""); // min salary input
  const [joblink, setJoblink] = useState(""); // job link input

  const navigate = useNavigate(); // for navigation
  const token = localStorage.getItem("token"); // JWT from login

  // --------------- AUTH GUARD ---------------
  useEffect(() => {
    // if user is not logged in, push them to login page
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // --------------- FETCH JOBS ON LOAD ---------------
  useEffect(() => {
    if (!token) return; // if no token, don't call API

    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError("");
        const res = await API.get("/jobs", {
          headers: {
            Authorization: `Bearer ${token}`, // send JWT to backend
          },
        });
        setJobs(res.data); // save jobs into state
      } catch (err) {
        console.error("Error fetching jobs:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // token invalid or expired: log out and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          navigate("/login");
        } else {
          setError("Error loading Jobs");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [token, navigate]);

  // --------------- ADD NEW JOB ---------------
  const handleAddJob = async (e) => {
    e.preventDefault(); // prevent full page reload

    try {
      setError("");
      setIsSaving(true);
      const salaryPayload = {};
      if (minSalary !== "") {
        salaryPayload.min = Number(minSalary); // convert to number
      }
      if (maxSalary !== "") {
        salaryPayload.max = Number(maxSalary); // convert to number
      }

      if (
        typeof salaryPayload.min === "number" &&
        typeof salaryPayload.max === "number" &&
        salaryPayload.min > salaryPayload.max
      ) {
        setError("Minimum salary cannot be higher than maximum salary.");
        return;
      }

      // send all job data to backend
      const res = await API.post(
        "/jobs",
        {
          company: company.trim(),
          position: position.trim(),
          status,
          notes: notes.trim(),
          salary:
            Object.keys(salaryPayload).length > 0 ? salaryPayload : undefined,
          joblink: joblink.trim(), // send empty string if user leaves it blank
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // auth header
          },
        }
      );

      // add new job at top of jobs array
      setJobs((prev) => [res.data, ...prev]);

      // reset form fields
      setCompany("");
      setPosition("");
      setStatus("Applied");
      setNotes("");
      setJoblink("");
      setMinSalary("");
      setMaxSalary("");

      // hide modal
      setShowForm(false);
    } catch (err) {
      console.error("Failed to add job:", err);
      setError("Failed to add job. Check the required fields and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // --------------- DELETE JOB ---------------
  const deleteJob = async (jobId) => {
    try {
      await API.delete(`/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // remove job locally
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error("Delete Failed:", err);
      setError("Failed to delete job. Please try again.");
    }
  };

  // --------------- UPDATE JOB STATUS ---------------
  const updateStatus = async (jobId, newStatus) => {
    const previousJob = jobs.find((j) => j._id === jobId); // backup old job

    // optimistic update in UI first
    setJobs((prevJobs) =>
      prevJobs.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
    );

    try {
      const res = await API.put(
        `/jobs/${jobId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // sync with server response
      setJobs((prevJobs) =>
        prevJobs.map((j) => (j._id === jobId ? res.data : j))
      );
    } catch (err) {
      console.error("Update failed:", err);

      // revert if API call failed
      if (previousJob) {
        setJobs((prevJobs) =>
          prevJobs.map((j) => (j._id === jobId ? previousJob : j))
        );
      }
      setError("Failed to update job status. Please try again.");
    }
  };

  // --------------- DRAG & DROP HANDLER ---------------
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return; // dropped outside any column

    const jobId = active.id; // from JobCard useDraggable({ id: job._id })
    const newStatus = over.id; // from JobColumn useDroppable({ id: status })
    const job = jobs.find((j) => j._id === jobId);

    if (job && job.status !== newStatus) {
      updateStatus(jobId, newStatus);
    }
  };

  // --------------- GROUP JOBS BY STATUS ---------------
  const groupedJobs = {
    Applied: [],
    Interview: [],
    Offer: [],
    Rejected: [],
  };

  jobs.forEach((job) => {
    if (groupedJobs[job.status]) {
      groupedJobs[job.status].push(job);
    }
  });

  const totalJobs = jobs.length;
  const activeJobs =
    groupedJobs.Applied.length +
    groupedJobs.Interview.length +
    groupedJobs.Offer.length;
  const interviewRate = totalJobs
    ? Math.round((groupedJobs.Interview.length / totalJobs) * 100)
    : 0;

  // --------------- RENDER ---------------
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="mx-auto min-h-[calc(100vh-65px)] w-full max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {/* top bar */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-300">
                Job tracker
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                {totalJobs
                  ? `${activeJobs} active opportunities across ${totalJobs} saved jobs`
                  : "Start by saving the roles you want to track."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[620px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Saved
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {totalJobs}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Active
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {activeJobs}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Interviews
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {groupedJobs.Interview.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {interviewRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag cards between columns or update status from each card.
            </p>
            <button
              type="button"
              onClick={() => setShowForm(true)} // open the modal
              className="
                inline-flex w-full items-center justify-center
                rounded-lg bg-blue-600 px-4 py-2.5
                text-sm font-semibold text-white shadow-sm
                transition hover:bg-blue-700
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-offset-slate-950
                sm:w-auto
              "
            >
              + Add job
            </button>
          </div>
        </div>

        {/* error message */}
        {error && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded px-1.5 font-semibold hover:bg-red-100 dark:hover:bg-red-900/50"
              aria-label="Dismiss error"
            >
              X
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <LoadingSpinner size="md" text="Loading jobs..." />
          </div>
        ) : (
          <>
            {totalJobs === 0 && (
              <div className="mb-5 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-5 py-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                Your board is empty. Add your first role to start tracking
                applications, interviews, and offers.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
              <JobColumn
                title="Applied"
                status="Applied"
                jobs={groupedJobs.Applied}
                onDelete={deleteJob}
                onStatusChange={updateStatus}
              />
              <JobColumn
                title="Interview"
                status="Interview"
                jobs={groupedJobs.Interview}
                onDelete={deleteJob}
                onStatusChange={updateStatus}
              />
              <JobColumn
                title="Offer"
                status="Offer"
                jobs={groupedJobs.Offer}
                onDelete={deleteJob}
                onStatusChange={updateStatus}
              />
              <JobColumn
                title="Rejected"
                status="Rejected"
                jobs={groupedJobs.Rejected}
                onDelete={deleteJob}
                onStatusChange={updateStatus}
              />
            </div>
          </>
        )}
      </div>

      {/* modal: Add New Job */}
      {showForm && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            overflow-y-auto
            bg-slate-950/50
            px-4 py-6
            backdrop-blur-sm
          "
        >
          <div
            className="
              relative
              w-full max-w-lg
              max-h-[calc(100vh-3rem)]
              overflow-y-auto
              rounded-xl
              border border-slate-200
              bg-white dark:bg-slate-900
              dark:border-slate-800
              shadow-2xl
              p-6 sm:p-8
            "
          >
            {/* close button */}
            <button
              type="button"
              aria-label="Close add job form"
              onClick={() => setShowForm(false)}
              className="
                absolute
                right-3 top-3
                rounded-md
                px-2 py-1
                text-sm
                font-semibold
                text-slate-400
                hover:bg-slate-100
                hover:text-slate-700
                dark:hover:bg-slate-800
                dark:hover:text-slate-200
              "
            >
              X
            </button>

            <h2 className="mb-1 text-xl font-semibold text-slate-950 dark:text-gray-100">
              Add New Job
            </h2>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              Save a role to your pipeline and update it as you move forward.
            </p>

            {/* form */}
            <form onSubmit={handleAddJob} className="space-y-4">
              {/* company */}
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                required
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  px-4 py-2
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />

              {/* position */}
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Position"
                required
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  px-4 py-2
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />

              {/* job link */}
              <input
                type="url"
                value={joblink}
                onChange={(e) => setJoblink(e.target.value)}
                placeholder="Job Link (optional)"
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  px-4 py-2
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />

              {/* salary min/max in one row */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="Min salary"
                    className="
                      w-full
                      border
                      border-slate-300
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                      px-4 py-2
                      rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                  />
                </div>
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="Max salary"
                    className="
                      w-full
                      border
                      border-slate-300
                      dark:border-slate-700
                      dark:bg-slate-950
                      dark:text-white
                      px-4 py-2
                      rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                    "
                  />
                </div>
              </div>

              {/* status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  px-4 py-2
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>

              {/* notes */}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                className="
                  w-full
                  border
                  border-slate-300
                  dark:border-slate-700
                  dark:bg-slate-950
                  dark:text-white
                  px-4 py-2
                  rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
              />

              {/* action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="
                    px-4 py-2
                    text-sm
                    rounded-lg
                    border border-gray-300
                    text-gray-700
                    hover:bg-gray-50
                    dark:border-slate-700
                    dark:text-slate-200
                    dark:hover:bg-slate-800
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="
                    inline-flex items-center justify-center
                    px-4 py-2
                    text-sm
                    rounded-lg
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    font-semibold
                    disabled:cursor-not-allowed
                    disabled:bg-blue-400
                  "
                >
                  {isSaving ? (
                    <LoadingSpinner text="Saving..." />
                  ) : (
                    "Save job"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DndContext>
  );
};

export default Dashboard;
