import mongoose, { Schema, Document, Types } from 'mongoose';

export type StudyPlanStatus = 'pending' | 'done';

export interface IStudyPlan extends Document {
  userId: Types.ObjectId;
  subjectId: Types.ObjectId;
  day: string; // ISO date, e.g. "2026-05-04"
  time: string; // "HH:mm", e.g. "09:00"
  topic: string;
  durationMinutes: number;
  status: StudyPlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StudyPlanSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    day: { type: String, required: true },
    time: { type: String, required: true },
    topic: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'done'], default: 'pending' },
  },
  { timestamps: true },
);

StudyPlanSchema.index({ userId: 1, subjectId: 1, day: 1, time: 1 }, { unique: true });
StudyPlanSchema.index({ userId: 1, day: 1 });

export default mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
