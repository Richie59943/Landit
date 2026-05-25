// src/components/JobCard.jsx
import React from "react";
import { format } from "date-fns";
import { useDraggable } from "@dnd-kit/core";

const JobCard = ({ job, onDelete, onStatusChange }) => {
  const [logoSource, setLogoSource] = React.useState("clearbit");

  // set up this card as draggable for dnd-kit
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job._id, // unique id so dnd-kit can track this job
    });

  // convert drag transform into an inline style
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  // helper to decide badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-200 text-blue-800";
      case "Interview":
        return "bg-yellow-200 text-yellow-800";
      case "Offer":
        return "bg-green-200 text-green-800";
      case "Rejected":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // build a logo URL using Clearbit
  const getCompanyDomain = (companyName) => {
    const domain = companyName
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]/g, "");
    return `${domain}.com`;
  };

  const getLogoUrl = (companyName) => {
    const domain = getCompanyDomain(companyName);

    if (logoSource === "favicon") {
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }

    return `https://logo.clearbit.com/${domain}`;
  };

  const companyInitials = job.company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  // format the salary object { min, max } into a nice string
  const formatSalary = (salary) => {
    if (!salary) return ""; // if no salary field, nothing to show

    const { min, max } = salary;

    const hasMin = typeof min === "number" && !Number.isNaN(min);
    const hasMax = typeof max === "number" && !Number.isNaN(max);

    if (hasMin && hasMax) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    }

    if (hasMin) {
      return `$${min.toLocaleString()}`;
    }

    if (hasMax) {
      return `$${max.toLocaleString()}`;
    }

    return ""; // both missing or invalid
  };

  const salaryText = formatSalary(job.salary); // precompute once

  // used on elements where we DO NOT want dragging to start
  const stopDrag = (e) => {
    e.stopPropagation(); // stops event before dnd-kit sees it
  };

  // delete handler that also cancels drag
  const handleDelete = (e) => {
    e.stopPropagation(); // avoid drag on click
    onDelete(job._id);
  };

  return (
    <div
      ref={setNodeRef} // dnd-kit ref
      style={style} // position based on drag
      {...listeners} // pointer listeners for drag
      {...attributes} // aria attributes etc.
      className={`bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg mb-4 cursor-grab active:cursor-grabbing transition
        ${isDragging ? "opacity-70 ring-2 ring-indigo-400" : ""}`}
    >
      {/* top row: position + company + status pill */}
      <div className="flex justify-between items-center mb-2">
        <div>
          {/* job title */}
          <h3 className="text-xl font-bold dark:text-white">{job.position}</h3>

          {/* company name with logo */}
          <div className="flex items-center gap-2">
            {logoSource === "initials" ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                {companyInitials || "Co"}
              </span>
            ) : (
              <img
                src={getLogoUrl(job.company)}
                alt={`${job.company} logo`}
                className="h-5 w-5 shrink-0 rounded bg-slate-100 object-contain"
                onError={() =>
                  setLogoSource((currentSource) =>
                    currentSource === "clearbit" ? "favicon" : "initials"
                  )
                }
              />
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {job.company}
            </p>
          </div>
        </div>

        {/* colored status badge */}
        <span
          className={`px-2 py-1 text-sm rounded ${getStatusColor(job.status)}`}
        >
          {job.status}
        </span>
      </div>

      {/* salary row (only if we have something to show) */}
      {salaryText && (
        <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
          Salary:{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {salaryText}
          </span>
        </p>
      )}

      {/* notes */}
      {job.notes && (
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          {job.notes}
        </p>
      )}

      {/* applied date */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Applied on{" "}
        {job.dateApplied || job.appliedDate || job.date || job.createdAt
          ? format(
              new Date(
                job.dateApplied || job.appliedDate || job.date || job.createdAt
              ),
              "PPP"
            )
          : "Unknown"}
      </p>

      {/* job link (clickable, but does NOT drag) */}
      {job.joblink && (
        <a
          href={job.joblink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopDrag} // block drag start on click
          onMouseDown={stopDrag} // block drag on mouse down
          onPointerDown={stopDrag} // block drag on pointer down
          className="
            inline-flex
            items-center
            text-xs
            text-blue-600
            dark:text-blue-400
            hover:underline
            mb-2
          "
        >
          View job posting
        </a>
      )}

      {/* status select + delete button row */}
      <div className="flex items-center justify-between mt-2">
        {/* status dropdown (drag should NOT be blocked here, changing is fine) */}
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job._id, e.target.value)}
          onClick={stopDrag}
          onMouseDown={stopDrag}
          onPointerDown={stopDrag}
          className="
            border
            dark:border-gray-600
            dark:bg-gray-700
            dark:text-white
            px-2 py-1
            rounded
            text-xs
          "
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* delete button, drag blocked */}
        <button
          onClick={handleDelete}
          onMouseDown={stopDrag}
          onPointerDown={stopDrag}
          className="
            ml-4
            text-red-600
            dark:text-red-400
            text-xs
            hover:bg-red-100
            dark:hover:bg-red-700/40
            px-2 py-1
            rounded
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
