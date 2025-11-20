// src/components/JobCard.jsx
import React from "react";
import { format } from "date-fns";
import { useDraggable } from "@dnd-kit/core";

const JobCard = ({ job, onDelete, onStatusChange }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: job._id, // unique id for this job
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

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

  const getLogoUrl = (companyName) => {
    const domain = companyName.toLowerCase().replace(/\s+/g, "") + ".com";
    return `https://logo.clearbit.com/${domain}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-gray-800 shadow-md p-4 rounded-lg mb-4 cursor-grab active:cursor-grabbing transition
        ${isDragging ? "opacity-70 ring-2 ring-indigo-400" : ""}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-xl font-bold dark:text-white">{job.position}</h3>
          <div className="flex items-center gap-2">
            <img
              src={getLogoUrl(job.company)}
              alt={`${job.company} logo`}
              className="w-5 h-5 rounded"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {job.company}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 text-sm rounded ${getStatusColor(job.status)}`}
        >
          {job.status}
        </span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        {job.notes}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Applied On{" "}
        {job.dateApplied || job.date
          ? format(new Date(job.dateApplied || job.date), "PPP")
          : "Unknown"}
      </p>

      <select
        value={job.status}
        onChange={(e) => onStatusChange(job._id, e.target.value)}
        className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-1 rounded mb-2 text-sm"
      >
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>

      <button
        onClick={() => onDelete(job._id)}
        className="ml-4 text-red-600 dark:text-red-400 text-sm hover:underline"
      >
        Delete
      </button>
    </div>
  );
};

export default JobCard;
