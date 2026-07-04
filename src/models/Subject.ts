import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubject extends Document {
  userId: Types.ObjectId;
  name: string;
  difficulty: number;
  examDate: Date;
  icon: string;
  targetHoursPerWeek: number; // "3h/week"
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema: Schema = new Schema<ISubject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    examDate: { type: Date, required: true },
    icon: { type: String, default: '📘', trim: true },
    targetHoursPerWeek: { type: Number, default: 2, min: 0, max: 40 },
    topics: { type: [String], default: [] },
  },
  { timestamps: true },
);

SubjectSchema.index({ userId: 1 });

export default mongoose.model<ISubject>('Subject', SubjectSchema);
