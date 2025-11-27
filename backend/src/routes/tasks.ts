import express, { Response } from 'express';
import Task from '../models/Task';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all tasks for a specific date
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ 
        success: false, 
        message: 'Date parameter is required (YYYY-MM-DD)' 
      });
      return;
    }

    const queryDate = new Date(date);
    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const tasks = await Task.find({
      userId: req.userId,
      date: {
        $gte: queryDate,
        $lt: nextDate
      }
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tasks' 
    });
  }
});

// Get task by ID
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch task' 
    });
  }
});

// Create new task
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, startTime, endTime, date, attachments } = req.body;

    // Validation
    if (!title || !category || !startTime || !endTime || !date) {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: title, category, startTime, endTime, date' 
      });
      return;
    }

    // Check for time conflicts
    const taskDate = new Date(date);
    const nextDate = new Date(taskDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const conflictingTasks = await Task.find({
      userId: req.userId,
      date: {
        $gte: taskDate,
        $lt: nextDate
      },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflictingTasks.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Time slot conflicts with existing task',
        conflictingTasks: conflictingTasks.map(t => ({
          id: t._id,
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime
        }))
      });
      return;
    }

    const task = new Task({
      userId: req.userId,
      title,
      description: description || '',
      category,
      startTime,
      endTime,
      date: taskDate,
      completed: false,
      attachments: attachments || []
    });

    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create task' 
    });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, startTime, endTime, date, completed, attachments } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
      return;
    }

    // Check for time conflicts (excluding current task)
    if (startTime && endTime && date) {
      const taskDate = new Date(date);
      const nextDate = new Date(taskDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const conflictingTasks = await Task.find({
        userId: req.userId,
        _id: { $ne: req.params.id },
        date: {
          $gte: taskDate,
          $lt: nextDate
        },
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      });

      if (conflictingTasks.length > 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Time slot conflicts with existing task',
          conflictingTasks: conflictingTasks.map(t => ({
            id: t._id,
            title: t.title,
            startTime: t.startTime,
            endTime: t.endTime
          }))
        });
        return;
      }
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (category !== undefined) task.category = category;
    if (startTime !== undefined) task.startTime = startTime;
    if (endTime !== undefined) task.endTime = endTime;
    if (date !== undefined) task.date = new Date(date);
    if (completed !== undefined) task.completed = completed;
    if (attachments !== undefined) task.attachments = attachments;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update task' 
    });
  }
});

// Delete task
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete task' 
    });
  }
});

// Toggle task completion
router.patch('/:id/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!task) {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
      return;
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.completed ? 'completed' : 'incomplete'}`,
      data: task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle task completion' 
    });
  }
});

export default router;