import express, { Response } from 'express';
import Habit from '../models/Habit';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Helper function to check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Helper function to check if date is yesterday
const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

// Get all habits for user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ createdAt: 1 });

    // Add today's completion status to each habit
    const habitsWithStatus = habits.map(habit => {
      const todayLog = habit.logs.find(log => isToday(log.date));
      return {
        ...habit.toObject(),
        completedToday: todayLog?.completed || false
      };
    });

    res.status(200).json({
      success: true,
      data: habitsWithStatus
    });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch habits' 
    });
  }
});

// Create new habit
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, emoji } = req.body;

    if (!name) {
      res.status(400).json({ 
        success: false, 
        message: 'Habit name is required' 
      });
      return;
    }

    const habit = new Habit({
      userId: req.userId,
      name,
      emoji: emoji || '✅',
      currentStreak: 0,
      logs: []
    });

    await habit.save();

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: habit
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create habit' 
    });
  }
});

// Toggle habit completion for today
router.patch('/:id/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!habit) {
      res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's log
    const todayLogIndex = habit.logs.findIndex(log => isToday(log.date));

    if (todayLogIndex !== -1) {
      // Toggle existing log
      const newCompletedStatus = !habit.logs[todayLogIndex].completed;
      habit.logs[todayLogIndex].completed = newCompletedStatus;

      // Update streak logic
      if (newCompletedStatus) {
        // Check if completed yesterday
        const yesterdayLog = habit.logs.find(log => isYesterday(log.date));
        if (yesterdayLog && yesterdayLog.completed) {
          habit.currentStreak += 1;
        } else {
          habit.currentStreak = 1; // Start new streak
        }
      } else {
        // Uncompleting today resets streak
        habit.currentStreak = 0;
      }
    } else {
      // Create new log for today
      habit.logs.push({
        date: today,
        completed: true
      });

      // Update streak
      const yesterdayLog = habit.logs.find(log => isYesterday(log.date));
      if (yesterdayLog && yesterdayLog.completed) {
        habit.currentStreak += 1;
      } else {
        habit.currentStreak = 1;
      }
    }

    await habit.save();

    const updatedHabit = {
      ...habit.toObject(),
      completedToday: habit.logs.find(log => isToday(log.date))?.completed || false
    };

    res.status(200).json({
      success: true,
      message: 'Habit toggled successfully',
      data: updatedHabit
    });
  } catch (error) {
    console.error('Toggle habit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle habit' 
    });
  }
});

// Update habit
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, emoji } = req.body;

    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!habit) {
      res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
      return;
    }

    if (name !== undefined) habit.name = name;
    if (emoji !== undefined) habit.emoji = emoji;

    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: habit
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update habit' 
    });
  }
});

// Delete habit
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!habit) {
      res.status(404).json({ 
        success: false, 
        message: 'Habit not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete habit' 
    });
  }
});

export default router;