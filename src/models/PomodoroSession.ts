import mongoose, { Schema, Document, Types } from 'mongoose';
import { pomodoroTypes } from '../constants/enums/pomodoroTypes.js';
import { pomodoroStatus } from '../constants/enums/pomodoroStatus.js';

export type PomodoroSessionType = typeof pomodoroTypes.WORK | typeof pomodoroTypes.SHORT_BREAK | typeof pomodoroTypes.LONG_BREAK;
export type PomodoroSessionStatus = typeof pomodoroStatus.PENDING | typeof pomodoroStatus.COMPLETED;

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

const PomodoroSessionSchema: Schema = new Schema<IPomodoroSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'StudyPlan', default: null },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    day: { type: String, required: true },
    sessionIndex: { type: Number, required: true },
    type: { type: String, enum: Object.values(pomodoroTypes), required: true },
    topic: { type: String, default: null },
    durationMinutes: { type: Number, required: true, min: 1 },
    status: { type: String, enum: Object.values(pomodoroStatus), default: pomodoroStatus.PENDING },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

PomodoroSessionSchema.index({ userId: 1, day: 1, sessionIndex: 1 }, { unique: true });

export default mongoose.model<IPomodoroSession>('PomodoroSession', PomodoroSessionSchema);
