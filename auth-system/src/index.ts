import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './utils/passportConfig';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Express session configuratioy
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use true if using HTTPS
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
import authRoutes from './routes/auth';
app.use('/api/v1/auth', authRoutes);

// **Base Route**
app.get('/api/v1', (req, res) => {
  res.status(200).json({ message: 'Hello, your API is running!' });
});

// Fallback route for unmatched routes
app.get('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI || '';

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('DB connection error:', err));
