import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import prayerRoutes from './routes/prayer.routes';
import userRoutes from './routes/user.routes';
import groupRoutes from './routes/group.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

// Error handling
app.use(errorHandler);

// Start server only after database connection
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 