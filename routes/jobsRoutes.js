import express from 'express';
import userAuth from '../middelwares/authMiddleware.js';
import {
  createJobController,
  deleteJobController,
  getAllJobsController,
  jobStatsController,
  updateJobController,
} from '../controllers/jobsController.js';

const router = express.Router();

// routes

// CREATE JOB || POST
router.post('/create-job', userAuth, createJobController);

// GET JOBS || GET
router.get('/get-jobs', userAuth, getAllJobsController);

// UPDATE JOBS || PUT || PATCH
router.patch('/update-job/:id', userAuth, updateJobController);

// DELELTE JOB || DELETE
router.delete('/delete-job/:id', userAuth, deleteJobController);

// JOBS STATS FILTER || GET
router.get('/job-stats', userAuth, jobStatsController);

export default router;
