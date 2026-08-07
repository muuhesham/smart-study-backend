import Subject, { ISubject } from "../models/Subject.js";
import { AppError } from "../utils/AppError.js";
import { SubjectResource } from "../resources/subjectResourc.js";

interface SubjectInput {
  name: string;
  difficulty: number;
  examDate: Date;
  icon?: string;
  targetHoursPerWeek?: number;
  topics?: string[];
}

const subjectService = {
  getSubjectsByUser: async (userId: string): Promise<ISubject[]> => {
    const subjects = await Subject.find({ userId })
      .select("-createdAt -updatedAt -__v")
      .sort({ examDate: 1 });

    return subjects.map(
      (subject) => new SubjectResource(subject) as unknown as ISubject,
    );
  },

  addSubject: async (userId: string, data: SubjectInput): Promise<ISubject> => {
    const isSubjectExist = await Subject.findOne({
      userId,
      name: data.name.trim(),
    });

    if (isSubjectExist) {
      throw new AppError(
        `Subject ${data.name} is already added to your profile`,
        400,
      );
    }

    const newSubject = new Subject({
      userId,
      ...data,
    });

    const savedSubject = await newSubject.save();
    return new SubjectResource(savedSubject as ISubject) as unknown as ISubject;
  },

  deleteSubject: async (subjectId: string, userId: string): Promise<void> => {
    if (!subjectId) {
      throw new AppError("Subject ID is required", 400);
    }

    const deletedSubject = await Subject.findOneAndDelete({
      _id: subjectId,
      userId,
    });

    if (!deletedSubject) {
      throw new AppError("User not authorized to delete this subject", 403);
    }
  },

  updateSubject: async (
    subjectId: string,
    userId: string,
    data: Partial<SubjectInput>,
  ): Promise<ISubject> => {
    if (!subjectId) {
      throw new AppError("Subject ID is required", 400);
    }

    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: subjectId, userId },
      { $set: data },
      { new: true, runValidators: true },
    );

    if (!updatedSubject) {
      throw new AppError(
        "Subject not found or user not authorized to update this subject",
        404,
      );
    }

    return new SubjectResource(
      updatedSubject as ISubject,
    ) as unknown as ISubject;
  },
};

export default subjectService;
