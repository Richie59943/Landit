// src/components/JobCard.jsx
import React from "react";
import { format } from "date-fns";
import { useDraggable } from "@dnd-kit/core";

const JobCard = ({ job, onDelete, onStatusChange }) => {
  const [logoSource, setLogoSource] = React.useState("clearbit");

  React.useEffect(() => {
    setLogoSource("clearbit");
  }, [job.company]);

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
        return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-800";
      case "Interview":
        return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800";
      case "Offer":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800";
      case "Rejected":
        return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800";
      default:
        return "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700";
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

  const companyInitials = (job.company || "")
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
    const confirmed = window.confirm(
      `Delete ${job.position} at ${job.company}?`
    );
    if (confirmed) {
      onDelete(job._id);
    }
  };

  return (
    <div
      ref={setNodeRef} // dnd-kit ref
      style={style} // position based on drag
      {...listeners} // pointer listeners for drag
      {...attributes} // aria attributes etc.
      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-slate-800 dark:bg-slate-950 2xl:p-5
        ${isDragging ? "opacity-70 ring-2 ring-blue-400" : ""}`}
    >
      {/* top row: position + company + status pill */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* job title */}
          <h3 className="truncate text-base font-bold text-slate-950 dark:text-white 2xl:text-lg">
            {job.position}
          </h3>

          {/* company name with logo */}
          <div className="flex items-center gap-2">
            {logoSource === "initials" ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {companyInitials || "Co"}
              </span>
            ) : (
              <img
                src={getLogoUrl(job.company)}
                alt={`${job.company} logo`}
                className="h-6 w-6 shrink-0 rounded-md bg-slate-100 object-contain dark:bg-slate-800"
                onError={() =>
                  setLogoSource((currentSource) =>
                    currentSource === "clearbit" ? "favicon" : "initials"
                  )
                }
              />
            )}
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {job.company}
            </p>
          </div>
        </div>

        {/* colored status badge */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusColor(job.status)}`}
        >
          {job.status}
        </span>
      </div>

      {/* salary row (only if we have something to show) */}
      {salaryText && (
        <p className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          Salary:{" "}
          <span className="font-semibold text-slate-950 dark:text-slate-100">
            {salaryText}
          </span>
        </p>
      )}

      {/* notes */}
      {job.notes && (
        <p className="mb-3 line-clamp-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
          {job.notes}
        </p>
      )}

      {/* applied date */}
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
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
            mb-3 rounded-md
            text-blue-600
            transition hover:text-blue-700
            dark:text-blue-300 dark:hover:text-blue-200
          "
        >
          Open job posting
        </a>
      )}

      {/* status select + delete button row */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        {/* status dropdown (drag should NOT be blocked here, changing is fine) */}
        <select
          value={job.status}
          onChange={(e) => onStatusChange(job._id, e.target.value)}
          onClick={stopDrag}
          onMouseDown={stopDrag}
          onPointerDown={stopDrag}
          className="
            border
            border-slate-300
            bg-white
            text-slate-700
            dark:border-slate-700
            dark:bg-slate-900
            dark:text-slate-100
            px-2.5 py-1.5
            rounded-md
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
            text-red-600
            dark:text-red-300
            text-xs
            font-semibold
            hover:bg-red-50
            dark:hover:bg-red-950/50
            px-2.5 py-1.5
            rounded-md
            transition
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
