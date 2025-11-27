import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string; // Custom input from user, NOT enum
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  date: Date;
  completed: boolean;
  attachments: string[]; // Array of file URLs
  createdAt: Date;
}

const taskSchema = new Schema<ITask>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
taskSchema.index({ userId: 1, date: 1 });

export default mongoose.model<ITask>('Task', taskSchema);