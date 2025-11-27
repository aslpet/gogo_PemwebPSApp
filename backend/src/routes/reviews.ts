import express, { Response } from 'express';
import DailyReview from '../models/DailyReview';
import Task from '../models/Task';
import Habit from '../models/Habit';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Rule-based AI comment generator (fallback when no OpenAI)
const generateAIComment = (score: number, tasksCompleted: number, tasksTotal: number, habitsCompleted: number, habitsTotal: number): string => {
  const taskPercentage = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
  const habitPercentage = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 100 : 0;

  if (score >= 85) {
    return `🎉 Exceptional work today! You crushed ${tasksCompleted} out of ${tasksTotal} tasks (${taskPercentage.toFixed(0)}%) and maintained ${habitsCompleted} out of ${habitsTotal} habits. You're building incredible momentum - keep this energy flowing into tomorrow! Your productivity score of ${score}/100 shows outstanding dedication.`;
  } else if (score >= 70) {
    return `✨ Excellent day! You completed ${tasksCompleted} out of ${tasksTotal} tasks and checked off ${habitsCompleted} habits. Your ${score}/100 score reflects solid progress. ${habitPercentage < 80 ? 'Consider focusing a bit more on your daily habits tomorrow to maintain consistency.' : 'Great balance between tasks and habits!'}`;
  } else if (score >= 55) {
    return `💪 Good effort! You finished ${tasksCompleted} tasks and ${habitsCompleted} habits today (score: ${score}/100). ${taskPercentage < 60 ? 'Tomorrow, try breaking down larger tasks into smaller, manageable chunks.' : ''} ${habitPercentage < 60 ? 'Your habits need a little more attention - small consistent actions build big results!' : 'Nice work on maintaining your habits!'}`;
  } else if (score >= 40) {
    return `🌱 It's okay to have challenging days. You completed ${tasksCompleted} tasks and ${habitsCompleted} habits (${score}/100). Tomorrow is a fresh start with new opportunities. ${tasksTotal > 5 ? 'Consider planning fewer, high-priority tasks to avoid overwhelm.' : ''} Remember: progress over perfection!`;
  } else {
    return `🌤️ Every journey has tough days - you completed ${tasksCompleted} tasks and ${habitsCompleted} habits today. Don't let a ${score}/100 score discourage you. Tomorrow, start with just 2-3 essential tasks and 2-3 key habits. Small wins build confidence. You've got this! 💙`;
  }
};

// Create or get daily review
router.post('/end-day', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if review already exists for today
    const existingReview = await DailyReview.findOne({
      userId: req.userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingReview) {
      res.status(200).json({
        success: true,
        message: 'Daily review already exists for today',
        data: existingReview
      });
      return;
    }

    // Get today's tasks
    const tasks = await Task.find({
      userId: req.userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter(t => t.completed).length;

    // Get habits
    const habits = await Habit.find({ userId: req.userId });
    const habitsTotal = habits.length;
    
    // Count habits completed today
    const habitsCompleted = habits.filter(habit => {
      const todayLog = habit.logs.find(log => {
        const logDate = new Date(log.date);
        return logDate.getDate() === today.getDate() &&
               logDate.getMonth() === today.getMonth() &&
               logDate.getFullYear() === today.getFullYear();
      });
      return todayLog?.completed || false;
    }).length;

    // Calculate productivity score (60% tasks, 40% habits)
    const taskScore = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 60 : 0;
    const habitScore = habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 40 : 0;
    const productivityScore = Math.round(taskScore + habitScore);

    // Generate AI comment (rule-based fallback)
    const aiComment = generateAIComment(
      productivityScore,
      tasksCompleted,
      tasksTotal,
      habitsCompleted,
      habitsTotal
    );

    // Create daily review
    const review = new DailyReview({
      userId: req.userId,
      date: today,
      tasksCompleted,
      tasksTotal,
      habitsCompleted,
      habitsTotal,
      productivityScore,
      aiComment
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Daily review created successfully',
      data: review
    });
  } catch (error) {
    console.error('End day error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create daily review' 
    });
  }
});

// Get all reviews (for history page)
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    
    const query = DailyReview.find({ userId: req.userId })
      .sort({ date: -1 });

    if (limit && typeof limit === 'string') {
      query.limit(parseInt(limit));
    }

    const reviews = await query;

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reviews' 
    });
  }
});

// Get heatmap data (last 365 days)
router.get('/heatmap', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    // Get all tasks and habits for the past year
    const tasks = await Task.find({
      userId: req.userId,
      date: { $gte: oneYearAgo }
    });

    const habits = await Habit.find({ userId: req.userId });

    // Create heatmap data structure
    const heatmapData: { [key: string]: { tasks: number; habits: number; total: number } } = {};

    // Process tasks
    tasks.forEach(task => {
      const dateKey = task.date.toISOString().split('T')[0];
      if (!heatmapData[dateKey]) {
        heatmapData[dateKey] = { tasks: 0, habits: 0, total: 0 };
      }
      if (task.completed) {
        heatmapData[dateKey].tasks += 1;
        heatmapData[dateKey].total += 1;
      }
    });

    // Process habits
    habits.forEach(habit => {
      habit.logs.forEach(log => {
        if (log.date >= oneYearAgo && log.completed) {
          const dateKey = log.date.toISOString().split('T')[0];
          if (!heatmapData[dateKey]) {
            heatmapData[dateKey] = { tasks: 0, habits: 0, total: 0 };
          }
          heatmapData[dateKey].habits += 1;
          heatmapData[dateKey].total += 1;
        }
      });
    });

    // Convert to array format
    const heatmapArray = Object.entries(heatmapData).map(([date, data]) => ({
      date,
      ...data
    }));

    res.status(200).json({
      success: true,
      data: heatmapArray
    });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch heatmap data' 
    });
  }
});

export default router;