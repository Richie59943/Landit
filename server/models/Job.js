const mongoose = require("mongoose"); // imports mongoose so we can defineschemas

//define the schema for a job application
const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // links this job to a specific user
      ref: "User", // reference to User model
      required: true, // each job must belong to a user
    },
    company: {
      type: String,
      required: true, // company name is required
    },
    companyWebsite: {
      type: String,
    },
    position: {
      type: String,
      required: true, // position title is required
    },
    status: {
      type: String,
      default: "Applied", // default status when job is created
    },
    notes: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    salary: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    salaryText: {
      type: String,
    },
    employmentType: {
      type: String,
    },
    workplaceType: {
      type: String,
    },
    requiredQualifications: {
      type: String,
    },
    preferredQualifications: {
      type: String,
    },
    skills: [
      {
        type: String,
      },
    ],
    joblink: {
      type: String,
    },
    applicationUrl: {
      type: String,
    },
    sourcePlatform: {
      type: String,
    },
    postingDate: {
      type: Date,
    },
    importConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
    appliedDate: {
      type: Date,
    },
  },
  { timestamps: true }
); // automatically manage createdAt and updatedAt fields

module.exports = mongoose.model("Job", jobSchema); //export the Job model based on the schema
