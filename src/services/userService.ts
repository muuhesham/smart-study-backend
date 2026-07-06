import UserModel from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { ProfileResource } from "../resources/userResource.js";
import { comparePassword } from "../utils/comparePassword.js";
import { hashPassword } from "../utils/hashPassword.js";
import { dashboardCache } from "../utils/cache.js";
import { generateToken } from "../utils/generateToken.js";

const userService = {
  userProfile: async ({ userId }: { userId: string }) => {
    const userData = await UserModel.findById(userId);

    if (!userData) {
      throw new AppError(`No data found`, 404);
    }

    const formattedUser = new ProfileResource(userData);
    return { user: formattedUser };
  },

  changeUserName: async ({
    userId,
    name,
  }: {
    userId: string;
    name: string;
  }) => {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name,
      },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      throw new AppError(`No data found`, 404);
    }

    const formattedUser = new ProfileResource(updatedUser);
    return { user: formattedUser };
  },

  changePassword: async ({
    userId,
    currentPassword,
    newPassword,
  }: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!currentPassword || !newPassword) {
      throw new AppError(`Required fields to update profile`, 400);
    }

    const user = await UserModel.findById(userId).select("+password");
    if (!user) {
      throw new AppError(`No data found`, 404);
    }

    const isMatch = await comparePassword(currentPassword, user.password);

    if (!isMatch) {
      throw new AppError(`Current Password not correct`, 400);
    }

    const isSameOldPassword = await comparePassword(
      newPassword,
      user?.password,
    );

    if (isSameOldPassword) {
      throw new AppError(`New password is the same old password`, 400);
    }

    const userNewPassword = await hashPassword(newPassword);
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { password: userNewPassword },
      { new: true },
    );

    if (!updatedUser) {
      throw new AppError(`User not found during update`, 404);
    }
    const token = generateToken({ _id: updatedUser.id });
    const formattedUser = new ProfileResource(updatedUser);
    return {
      user: formattedUser,
      token,
    };
  },

  deleteProfile: async ({ userId }: { userId: string }) => {
    await UserModel.deleteOne({ _id: userId });
  },

  changeDailyHours: async ({
    newDailyHours,
    userId,
  }: {
    newDailyHours: number;
    userId: string;
  }) => {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        dailyStudyHours: newDailyHours,
      },
      {
        new: true,
      },
    );

    if (!updatedUser) {
      throw new AppError(`No data found`, 404);
    }

    dashboardCache.delete(userId);
    const formattedUser = new ProfileResource(updatedUser);
    return { user: formattedUser };
  },

  changeEmail: async ({
    newEmail,
    userId,
  }: {
    newEmail: string;
    userId: string;
  }) => {
    const isEmailExists = await UserModel.findOne({ email: newEmail });
    if (isEmailExists) {
      throw new AppError("Invalid Email. try another one", 400);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { email: newEmail },
      { new: true },
    );

    if (!updatedUser) {
      throw new AppError(`No data found`, 404);
    }

    const formattedUser = new ProfileResource(updatedUser);
    return { user: formattedUser };
  },
};

export default userService;
