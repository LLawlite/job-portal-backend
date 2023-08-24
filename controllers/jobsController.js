import jobsModel from '../models/jobsModel.js';
import mongoose from 'mongoose';
import moment from 'moment';
// --- CREATE JOB ---- //
export const createJobController = async (req, res, next) => {
  const { position, company } = req.body;
  //   if (!company || !position) {
  //     next('Please Provide All Fields');
  //   }

  req.body.createdBy = req.user.userId;
  try {
    const job = await jobsModel.create(req.body);
    res.status(201).send({
      success: true,
      message: 'Successfully create the job',
      job,
    });
  } catch (error) {
    next(error);
  }
};

// ************* GET JOBS************* //
export const getAllJobsController = async (req, res, next) => {
  // const jobs = await jobsModel.find({ createdBy: req.user.userId });

  const { status, workType, search, sort } = req.query;
  //condition for searching filters
  // creating query Object on the basis of user ID
  const queryObject = {
    createdBy: req.user.userId,
  };

  // logic filter
  if (status && status !== 'all') {
    queryObject.status = status;
  }
  if (workType && workType !== 'all') {
    queryObject.workType = workType;
  }
  if (search) {
    //case insensiteve for regex 'i'
    queryObject.position = { $regex: search, $options: 'i' };
  }

  let queryResult = jobsModel.find(queryObject);

  //sorting
  if (sort === 'latest') {
    queryResult = queryResult.sort('-createdAt');
  }
  if (sort === 'oldest') {
    queryResult = queryResult.sort('createdAt');
  }
  if (sort === 'a-z') {
    queryResult = queryResult.sort('position');
  }
  if (sort === 'z-a') {
    queryResult = queryResult.sort('-position');
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  queryResult = queryResult.skip(skip).limit(limit);

  //jobs count
  const totalJobs = await jobsModel.countDocuments(queryResult);
  const numOfPage = Math.ceil(totalJobs / limit);

  const jobs = await queryResult;

  res.status(200).send({
    success: true,
    totalJobs,
    numOfPage,
    jobs,
  });
};

// ************ UPDATE JOBS *************
export const updateJobController = async (req, res, next) => {
  console.log('UYes');
  try {
    const { id } = req.params;
    const { company, position } = req.body;
    console.log(id, position, company);
    // validation
    if (!company || !position) {
      next('Please Provid all Fields');
    }

    //find job
    const job = await jobsModel.findOne({ _id: id });
    //validation
    if (!job) {
      next(`No jobs found with this id ${id}`);
      return;
    }
    if (!req.user.userId === job.createdBy.toString()) {
      next('You are Not Authorized to update this job');
      return;
    }

    const updateJob = await jobsModel.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ updateJob });
  } catch (error) {
    next(error);
  }
};

// DELETE JOB

export const deleteJobController = async (req, res, next) => {
  try {
    const { id } = req.params;
    // find JOB
    const job = await jobsModel.findOne({ _id: id });
    //vallidation
    if (!job) {
      next(`No job found with This ID ${id}`);
      return;
    }
    if (req.user.userId !== job.createdBy.toString()) {
      next('You are Not authorize to delete this job');
      return;
    }
    await job.deleteOne();
    res.status(200).send({
      message: 'Success, Job Deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ***************** JOBS STATS ANS FILTER ***********

export const jobStatsController = async (req, res, next) => {
  try {
    const stats = await jobsModel.aggregate([
      // search by user jobs
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    //default stats
    const defaultStats = {
      pending: stats.pending || 0,
      reject: stats.reject || 0,
      interview: stats.interview || 0,
    };

    // monthly yearly stats
    let monthlyApplication = await jobsModel.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user.userId),
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    monthlyApplication = monthlyApplication.map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMMM y');
      return { date, count };
    });

    res.status(200).send({
      totalJobs: stats.length,
      monthlyApplication,
      defaultStats,
    });
  } catch (error) {
    next(error);
  }
};
