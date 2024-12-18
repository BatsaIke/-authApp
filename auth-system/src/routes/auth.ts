import express from 'express';
import { login, signup, requestPasswordReset, resetPassword, getUserDetails } from '../controllers/authController';
import passport from '../utils/passportConfig';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

// Google Login Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback Route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/login' }),
  (req, res) => {
    res.redirect('/'); // Successful authentication
  }
);

// Signup Route
router.post('/signup', signup);

// Login Route
router.post('/login', login);

// Request Password Reset
router.post('/request-password-reset', requestPasswordReset);

// Reset Password
router.post('/reset-password/:token', resetPassword);




// Public Routes
;

// Private Routes (Requires Authentication)
router.get('/user-details', verifyToken, getUserDetails);
export default router;
