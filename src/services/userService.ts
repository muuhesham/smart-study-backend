import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { ProfileResource, UserResource } from "../resources/userResource.js";
import { comparePassword } from "../utils/comparePassword.js";
import { hashPassword } from "../utils/hashPassword.js";

const userService = {
  userProfile: async ({ userId }: { userId: string }) => {
    if (!userId) {
      throw new AppError(`Unauthorized`, 401);
    }

    const userData = await User.findById(userId);

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
    if (!userId) {
      throw new AppError(`Unauthorized`, 401);
    }

    if (!name) {
      throw new AppError(`Required name to update profile`, 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError(`No data found`, 404);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
      },
      { 
        new: true 
      },
    );
    const formattedUser = new UserResource(updatedUser);
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
    if (!userId) {
      throw new AppError(`Unauthorized`, 401);
    }

    if (!currentPassword || !newPassword) {
      throw new AppError(`Required fields to update profile`, 400);
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError(`No data found`, 404);
    }

    const isMatch = await comparePassword(currentPassword, user?.password);

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
    await User.updateOne({ _id: userId }, { password: userNewPassword });
  },

  deleteProfile: async ({ userId }: { userId: string }) => {
    if (!userId) {
      throw new AppError(`No data found`, 404);
    }
    await User.deleteOne({ _id: userId });
  },
};

export default userService;
