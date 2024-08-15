import { Request, Response } from 'express';
import User, { IUser } from '../models/user.model';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken';
import jwt from 'jsonwebtoken';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from '../nodemailer.ts/emails';
import crypto from 'crypto';
import config from '../utils/config';

export const signup = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'All fields are required',
      });
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const newUser: IUser = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await newUser.save();
    // generateToken(newUser._id.toString());

    await sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'User created successfully',
      user: {
        ...newUser.toObject(),
        password: undefined,
      },
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Server error',
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'User does not exist',
      });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Invalid credentials',
      });
    }

    // await generateToken(user._id.toString());
    const token = generateToken(user._id.toString());

    user.lastLogin = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'User logged in successfully',
      token,
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Server error',
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const { verificationToken, email } = req.body;
  try {
    const user = await User.findOne({
      verificationToken,
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Invalid or expired verification token',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'Email verified successfully',
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Server error',
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Invalid or expired verification token',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    // Generate JWT token after successful verification
    const token = generateToken(user._id.toString());

    await sendVerificationEmail(user.email, code);

    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'Email verified successfully',
      token,
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Server error',
    });
  }
};

export const tokenValid = async (req: Request, res: Response) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.json(false);
    }

    const decoded = jwt.verify(token, `${config.jwtSecret}`) as { id: string };
    if (!decoded) {
      return res.json(false);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Find and delete the user from the database
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const url = config.clientUrl;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'User not found',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      email,
      user.name,
      `${url}/reset-password/${resetToken}`,
    );

    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'Password reset link sent to your email',
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Server error',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        status: 'failed',
        message: 'Invalid or expired token',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email, user.name);
    return res.status(200).json({
      success: true,
      status: 'success',
      message: 'Password reset successfully',
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      status: 'failed',
      message: 'Server error',
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    // Ensure user ID is provided
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Retrieve user information, excluding the password
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Respond with user data
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error(`Error in checkAuth: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

