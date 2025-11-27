import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitLog {
  date: Date;
  completed: boolean;
}

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  emoji: string;
  currentStreak: number;
  logs: IHabitLog[];
  createdAt: Date;
}

const habitLogSchema = new Schema<IHabitLog>({
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

const habitSchema = new Schema<IHabit>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  emoji: {
    type: String,
    required: true,
    default: '✅'
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  logs: [habitLogSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
habitSchema.index({ userId: 1, createdAt: 1 });

export default mongoose.model<IHabit>('Habit', habitSchema);