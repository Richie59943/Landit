const Job = require('../models/Job');

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ dateApplied: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// POST /api/jobs (you should already have this)
const addJob = async (req, res) => {
  const { company, position, status, notes } = req.body;
  const userId = req.userId;

  const newJob = new Job({ userId, company, position, status, notes });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add job' });
  }
};


// this is going to allow us to delete a job
const deleteJob = async (req,res) => {
  try {
    const job = await Job.findOneAndDelete({_id:req.params.id, userId: req.userId});
    if(!job) return res.status(404).json({message: ' Job Not Found'});
    res.status(200).json({message: ' Job Deleted'});

  }
  catch (err) {
    res.status(500).json({message: 'Delete Failed'});
  }
};


///update job status from applied ->interveiw ->ect

const updateJobStatus = async (req,res) => {
  const {status} = req.body; // gets a new status from the requested body 

  try {
    const job = await Job.findOneAndUpdate(
      {_id: req.params.id, userId:req.userId}, // finds the job by user id and user
      { status}, // sets a new status
      {new:true} // returns updated job 
    );

    if(!job) {
      return res.status(404).json({message: "Job Not Found"});
    }

    res.json(job); // send updated job to front end 

  }

  catch(err){
    res.status(500).json({message:"update failed"});
  }

};
module.exports = {
  getJobs,
  addJob,
  deleteJob,         //  Add delete function
  updateJobStatus,   //  Add status update function
};