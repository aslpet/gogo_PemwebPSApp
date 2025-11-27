import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Habit from '../models/Habit';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Default habits to seed for new users
const DEFAULT_HABITS = [
  { name: 'Drink Water', emoji: '💧' },
  { name: 'Read 15 Minutes', emoji: '📚' },
  { name: 'Sleep 7 Hours', emoji: '😴' },
  { name: 'Tidy Up', emoji: '🧹' },
  { name: 'Custom Habit', emoji: '✨' }
];

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide username, email, and password' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
      return;
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      darkMode: false
    });

    await user.save();

    // Seed default habits
    const habitPromises = DEFAULT_HABITS.map(habit => {
      return new Habit({
        userId: user._id,
        name: habit.name,
        emoji: habit.emoji,
        currentStreak: 0,
        logs: []
      }).save();
    });

    await Promise.all(habitPromises);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          darkMode: user.darkMode
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          darkMode: user.darkMode
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        darkMode: user.darkMode
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user data' 
    });
  }
});

// Update dark mode preference
router.patch('/dark-mode', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { darkMode } = req.body;

    if (typeof darkMode !== 'boolean') {
      res.status(400).json({ 
        success: false, 
        message: 'darkMode must be a boolean value' 
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { darkMode },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Dark mode preference updated',
      data: {
        darkMode: user.darkMode
      }
    });
  } catch (error) {
    console.error('Update dark mode error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update dark mode preference' 
    });
  }
});

export default router;