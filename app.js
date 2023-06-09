import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import loginRouter from './routes/login.route.js';
import postsRouter from './routes/posts.route.js';
import userRouter from './routes/users.route.js';
import imageRouter from './routes/image.route.js';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connection to MongoDB:', error.message);
  });

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/posts', postsRouter);
app.use('/api/users', userRouter);
app.use('/images', imageRouter);

export default app;
