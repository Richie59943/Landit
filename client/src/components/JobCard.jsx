import React from 'react';
import { format } from 'date-fns'; // used to format the datea 

const JobCard = ({ job, onDelete, onStatusChange}) => {// this accepts job data and two functions (the delte and status change)

const getStatusColor = (status) => {
  switch (status) {
    case 'Applied':
      return 'bg-blue-200 text-blue-800'; // Light blue
    case 'Interview':
      return 'bg-yellow-200 text-yellow-800'; // Yellow
    case 'Offer':
      return 'bg-green-200 text-green-800'; // Green
    case 'Rejected':
      return 'bg-red-200 text-red-800'; // Red
    default:
      return 'bg-gray-200 text-gray-800'; // Fallback
  }
};


// using Clearbit LOGO API we are going to conver Name into a domain to grab the logo
const getLogoUrl = (companyName) => {
    const domain = companyName.toLowerCase().replace(/\s+/g, '') + '.com'; // turns the name into a domain
    return `https:logo.clearbit.com/${domain}`;
};

return (
    <div className="bg-white shadow-md p-4 rounded-lg mb-4"> {/* Card box */}
      <div className="flex justify-between items-center mb-2"> {/* Top row: title + status */}
        <div>
          <div className="flex items-center gap-2">
            <img
              src={getLogoUrl(job.company)}
              alt={`${job.company} logo`}
              className="w-5 h-5 rounded"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="text-sm text-gray-600">{job.company}</p>
          </div>
          <h3 className="text-xl font-bold">{job.position}</h3> {/* Job title */}
        </div>
        <span className={`px-2 py-1 text-sm rounded ${getStatusColor(job.status)}`}> {/* Status badge */}
          {job.status}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-2">{job.notes}</p> {/* Any notes */}
      <p className="text-xs text-gray-500 mb-2">
  Applied on {job.dateApplied ? format(new Date(job.dateApplied), 'PPP') : 'Unknown'}
</p>
      {/* Dropdown to change job status */}
      <select
        value={job.status}
        onChange={(e) => onStatusChange(job._id, e.target.value)} // Calls function when status changes
        className="border p-1 rounded mb-2 text-sm"
      >
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
      </select>

      {/* Delete button */}
      <button
        onClick={() => onDelete(job._id)} // Calls delete function when clicked
        className="ml-4 text-red-600 text-sm hover:underline"
      >
        Delete
      </button>
    </div>
  );
};

export default JobCard; // Exports the component so it can be used in other files
