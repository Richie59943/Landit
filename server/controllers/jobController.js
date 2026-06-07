const Job = require("../models/Job");
const { parseJobFromUrl } = require("../services/jobParser");

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

// POST /api/jobs (you should already have this)
const addJob = async (req, res) => {
  const {
    company,
    companyWebsite,
    position,
    status,
    notes,
    description,
    location,
    salary,
    salaryText,
    employmentType,
    workplaceType,
    requiredQualifications,
    preferredQualifications,
    skills,
    applicationUrl,
    sourcePlatform,
    postingDate,
    importConfidence,
  } = req.body;
  const joblink = req.body.joblink || req.body.jobLink || "";
  const userId = req.userId;

  const newJob = new Job({
    userId,
    company: company?.trim(),
    companyWebsite: companyWebsite?.trim(),
    position: position?.trim(),
    status,
    notes: notes?.trim(),
    description: description?.trim(),
    location: location?.trim(),
    salary,
    salaryText: salaryText?.trim(),
    employmentType: employmentType?.trim(),
    workplaceType: workplaceType?.trim(),
    requiredQualifications: requiredQualifications?.trim(),
    preferredQualifications: preferredQualifications?.trim(),
    skills: Array.isArray(skills)
      ? skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [],
    joblink: joblink.trim(),
    applicationUrl: applicationUrl?.trim() || joblink.trim(),
    sourcePlatform: sourcePlatform?.trim(),
    postingDate: postingDate ? new Date(postingDate) : undefined,
    importConfidence,
  });

  try {
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ message: "Failed to add job" });
  }
};

const parseJobLink = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Job link is required" });
    }

    const parsedJob = await parseJobFromUrl(url);
    res.json(parsedJob);
  } catch (err) {
    res.status(err.statusCode || 400).json({
      message:
        err.message ||
        "We couldn't fully extract this job posting. You can still complete the form manually.",
    });
  }
};

// this is going to allow us to delete a job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!job) return res.status(404).json({ message: " Job Not Found" });
    res.status(200).json({ message: " Job Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed" });
  }
};

///update job status from applied ->interveiw ->ect

const updateJobStatus = async (req, res) => {
  const { status } = req.body; // gets a new status from the requested body

  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // finds the job by user id and user
      { status }, // sets a new status
      { new: true } // returns updated job
    );

    if (!job) {
      return res.status(404).json({ message: "Job Not Found" });
    }

    res.json(job); // send updated job to front end
  } catch (err) {
    res.status(500).json({ message: "update failed" });
  }
};
module.exports = {
  getJobs,
  addJob,
  parseJobLink,
  deleteJob, //  Add delete function
  updateJobStatus, //  Add status update function
};
