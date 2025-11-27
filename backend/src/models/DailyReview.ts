import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyReview extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  productivityScore: number; // 0-100
  aiComment: string;
  createdAt: Date;
}

const dailyReviewSchema = new Schema<IDailyReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  tasksCompleted: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tasksTotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  habitsCompleted: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  habitsTotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  productivityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  aiComment: {
    type: String,
    required: true,
    maxlength: [1000, 'AI comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
dailyReviewSchema.index({ userId: 1, date: -1 });

// Unique constraint: one review per user per day
dailyReviewSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyReview>('DailyReview', dailyReviewSchema);