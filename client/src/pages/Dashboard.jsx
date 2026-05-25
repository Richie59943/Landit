// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // for redirects
import API from "../utils/api"; // axios instance for API calls
import { isAuthenticated } from "../utils/auth"; // checks if token exists
import { DndContext } from "@dnd-kit/core"; // drag-and-drop context
import JobColumn from "../components/JobColumn"; // column component for each status

const Dashboard = () => {
  // ---------------- STATE ----------------
  const [jobs, setJobs] = useState([]); // all jobs from backend
  const [error, setError] = useState(""); // global error message
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
      }
    };

    fetchJobs();
  }, [token, navigate]);

  // --------------- ADD NEW JOB ---------------
  const handleAddJob = async (e) => {
    e.preventDefault(); // prevent full page reload

    try {
      const salaryPayload = {};
      if (minSalary !== "") {
        salaryPayload.min = Number(minSalary); // convert to number
      }
      if (maxSalary !== "") {
        salaryPayload.max = Number(maxSalary); // convert to number
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
      setError("Failed to add job");
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

  // --------------- RENDER ---------------
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-6 max-w-9xl mx-auto dark:bg-gray-900">
        {/* top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Dashboard
          </h1>

          <button
            type="button"
            onClick={() => setShowForm(true)} // open the modal
            className="
              bg-blue-600
              hover:bg-blue-700
              dark:bg-blue-500
              dark:hover:bg-blue-600
              text-white
              text-sm
              font-semibold
              px-4
              py-2
              rounded-lg
              shadow-md
            "
          >
            + Add job
          </button>
        </div>

        {/* error message */}
        {error && (
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}

        {/* Kanban columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
      </div>

      {/* modal: Add New Job */}
      {showForm && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40
          "
        >
          <div
            className="
              relative
              w-full max-w-lg
              bg-white dark:bg-gray-800
              rounded-xl
              shadow-2xl
              p-6 sm:p-8
            "
          >
            {/* close button */}
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="
                absolute
                right-3 top-3
                text-gray-400
                hover:text-gray-600
                text-sm
              "
            >
              X
            </button>

            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Add New Job
            </h2>

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
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  px-4 py-2
                  rounded
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
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  px-4 py-2
                  rounded
                "
              />

              {/* job link */}
              <input
                type="text"
                value={joblink}
                onChange={(e) => setJoblink(e.target.value)}
                placeholder="Job Link (optional)"
                className="
                  w-full
                  border
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  px-4 py-2
                  rounded
                "
              />

              {/* salary min/max in one row */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="Min salary"
                    className="
                      w-full
                      border
                      dark:border-gray-600
                      dark:bg-gray-700
                      dark:text-white
                      px-4 py-2
                      rounded
                    "
                  />
                </div>
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <div className="flex-1">
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(e.target.value)}
                    placeholder="Max salary"
                    className="
                      w-full
                      border
                      dark:border-gray-600
                      dark:bg-gray-700
                      dark:text-white
                      px-4 py-2
                      rounded
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
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  px-4 py-2
                  rounded
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
                  dark:border-gray-600
                  dark:bg-gray-700
                  dark:text-white
                  px-4 py-2
                  rounded
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
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    px-4 py-2
                    text-sm
                    rounded-lg
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    font-semibold
                  "
                >
                  Save job
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
