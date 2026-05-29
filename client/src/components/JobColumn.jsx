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
        min-h-[300px] rounded-xl border p-3 transition sm:p-4 2xl:min-h-[520px] 2xl:p-5
        ${
          isOver
            ? "border-blue-300 bg-blue-50 shadow-sm dark:border-blue-700 dark:bg-blue-950/40"
            : "border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900"
        }
      `}
    >
      <h2 className="mb-4 flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        <span>{title}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
          {jobs.length}
        </span>
      </h2>

      <div className="space-y-3 2xl:space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}

        {jobs.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-center text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
            Drop a card here or change a job status to move it into {title}.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobColumn;
