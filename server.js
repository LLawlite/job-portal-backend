//packages imports
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import morgan from 'morgan';

//files imports
import connectDB from './config/db.js';
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorMiddleware from './middelwares/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import jobsRoutes from './routes/jobsRoutes.js';
// config dot env
dotenv.config();

//security Packages
import helmet from 'helmet';
import xss from 'xss-clean';
import ExpressMongoSanitize from 'express-mongo-sanitize';

//mongodb connection
connectDB();

// rest-objects
const app = express();

// middleware
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
// app.use(xss());
app.use(ExpressMongoSanitize());

// routes
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job', jobsRoutes);

// validation middleware
app.use(errorMiddleware);

//port
const PORT = process.env.PORT || 3000;
// listen
app.listen(PORT, () => {
  console.log(
    `Server started successfully at ${PORT} in ${process.env.DEV_MODE} mode`
      .yellow.bold
  );
});
