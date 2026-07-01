import mongoose, { Schema, Document, Types } from 'mongoose';

export type PomodoroSessionType = 'work' | 'short_break' | 'long_break';
export type PomodoroSessionStatus = 'pending' | 'completed';

export interface IPomodoroSession extends Document {
  userId: Types.ObjectId;
  day: string; 
  sessionIndex: number; 
  type: PomodoroSessionType;
  subjectId: Types.ObjectId | null;
  topic: string | null;
  planId: Types.ObjectId | null;
  durationMinutes: number;
  status: PomodoroSessionStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PomodoroSessionSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true },
    sessionIndex: { type: Number, required: true },
    type: { type: String, enum: ['work', 'short_break', 'long_break'], required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    topic: { type: String, default: null },
    planId: { type: Schema.Types.ObjectId, ref: 'StudyPlan', default: null },
    durationMinutes: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

PomodoroSessionSchema.index({ userId: 1, day: 1, sessionIndex: 1 }, { unique: true });

export default mongoose.model<IPomodoroSession>('PomodoroSession', PomodoroSessionSchema);
