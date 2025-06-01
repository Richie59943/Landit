import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import JobCard from '../components/JobCard';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]); // Store job entries
  const [error, setError] = useState(''); // Handle errors

  // State for form inputs
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('Applied'); // Default value
  const [notes, setNotes] = useState('');

  const token = localStorage.getItem('token'); // JWT token from login

  // Fetch all jobs from backend on page load
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await API.get('/jobs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJobs(res.data); // Save jobs in state
      } catch (err) {
        setError('Error loading Jobs');
      }
    };

    fetchJobs();
  }, [token]);

  // Handle form submit to add a new job
  const handleAddJob = async (e) => {
    e.preventDefault(); // Prevent form refresh

    try {
      const res = await API.post(
        '/jobs',
        { company, position, status, notes }, // data to send
        {
          headers: {
            Authorization: `Bearer ${token}`, // auth required
          },
        }
      );

      setJobs([res.data, ...jobs]); // Add new job to top of the list
      // Reset the form
      setCompany('');
      setPosition('');
      setStatus('Applied');
      setNotes('');
    } catch (err) {
      setError('Failed to add job');
    }
  };


//adding the delete job 
const deleteJob = async(jobId) =>{
  try {
    await API.delete(`/jobs/${jobId}`, { // waitng for the api and gets the information 
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`},
    });
    setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId)); // removes from the state and keeps the ones we didnt delete
  } catch(err) {
    console.error('Delete Failed:',err);
  }
};


//adding to update the status 
const updateStatus = async (jobId, newStatus) => {
  try {
    const res = await API.put(
      `/jobs/${jobId}`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }
    );
    // Update local state with new status
    setJobs(jobs.map((j) => (j._id === jobId ? res.data : j)));
  } catch (err) {
    console.error('Update failed:', err);
  }
};






  return (
    <div className="p-6 max-w-3xl mx-auto dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">Dashboard</h1>

      {/* Error Message */}
      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      {/* New Job Form */}
      <form onSubmit={handleAddJob} className="mb-8 bg-white dark:bg-gray-800 shadow p-6 rounded space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Add New Job</h2>

        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          required
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 rounded"
        />

        <input
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Position"
          required
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 rounded"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 rounded"
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 rounded"
        />

        <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-600">
          Add Job
        </button>
      </form>

      {/* List of Jobs */}
      <ul className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            onDelete={deleteJob}
            onStatusChange={updateStatus}
          />
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;