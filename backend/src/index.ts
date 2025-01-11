import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/connection';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import prayerRoutes from './routes/prayer';
import prayerChainRoutes from './routes/prayerChainRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/prayer-chains', prayerChainRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 