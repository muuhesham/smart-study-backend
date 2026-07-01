import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgress extends Document {
  userId: Types.ObjectId;
  subjectId: Types.ObjectId;
  day: string;
  studyHours: number;
  notes?: string;
  pomodorosCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    day: { type: String, required: true },
    studyHours: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    pomodorosCompleted: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

// One progress entry per subject, per day, per user.
ProgressSchema.index({ userId: 1, subjectId: 1, day: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
