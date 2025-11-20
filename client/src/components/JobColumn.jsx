// src/components/JobColumn.jsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import JobCard from "./JobCard";

const JobColumn = ({ title, status, jobs, onDelete, onStatusChange }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status, // each column identified by its status
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 rounded-lg p-4 min-h-[250px] transition
        ${
          isOver
            ? "bg-indigo-50 dark:bg-indigo-900/30"
            : "bg-gray-100 dark:bg-gray-900"
        }
      `}
    >
      <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {jobs.length}
        </span>
      </h2>

      {jobs.map((job) => (
        <JobCard
          key={job._id}
          job={job}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default JobColumn;
