const mongoose = require('mongoose');

// Define the schema for a Job Application
const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  status: { type: String, default: 'Applied' },
  dateApplied: { type: Date, default: Date.now },
  notes: { type: String },
});

module.exports = mongoose.model('Job', jobSchema);
