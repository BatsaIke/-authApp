import { Request, Response } from 'express';
import { hashPassword, comparePassword, generateToken, generateRefreshToken, generateResetToken } from '../utils/authUtils';
import { sendEmail } from '../utils/emailUtils';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../types/types'; 

//@route   POST api/v1/auth/signup
//@desc    Register a new user
//@access  Public
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      res.status(400).json({ message: 'Email or phone number already in use' });
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ fullName, email, phone, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//@route   POST api/v1/auth/login
//@desc    Login user and return access and refresh tokens
//@access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    // Convert _id to string to resolve TypeScript error
    const token = generateToken(user._id.toString(), '1h');
    const refreshToken = generateRefreshToken(user._id.toString(), '7d');

    res.status(200).json({ token, refreshToken });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


// Request Password Reset
//@route   POST api/v1/auth/request-password-reset
//@desc    Send a password reset link to the user's email
//@access  Public
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Generate reset token
    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Use dynamic base URL
    const resetURL = `${process.env.BASE_URL}/api/v1/auth/reset-password/${resetToken}`;

    await sendEmail(user.email, 'Password Reset Request', `Reset your password here: ${resetURL}`);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending password reset email', error });
  }
};


//@route   POST api/v1/auth/reset-password/:token
//@desc    Reset user password using a valid reset token
//@access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//@route   GET api/v1/auth/user-details
//@desc    Get details of the currently authenticated user
//@access  Private


export const getUserDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.authUser?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized - No user ID found' });
      return;
    }

    const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
