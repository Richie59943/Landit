const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getJobs,
    addJob,
    deleteJob,
    updateJobStatus
  } = require('../controllers/jobController');
  


router.get('/', authMiddleware, getJobs);     //GET /api/jobs
router.post('/', authMiddleware, addJob);     //post /api/jobs
router.delete('/:id', authMiddleware, deleteJob); // deletes
router.put('/:id', authMiddleware, updateJobStatus); // updates

module.exports = router;