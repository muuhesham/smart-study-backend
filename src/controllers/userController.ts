import { Request, Response } from "express";
import userService from "../services/userService.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { sendResponse } from "../utils/sendResponse.js";

const userController = {
  getUserProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { user } = await userService.userProfile({ userId });

    return sendResponse(res, 200, true, undefined, user);
  }),

  changeUserName: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const name = req.body.name;
    const { user } = await userService.changeUserName({ userId, name });

    return sendResponse(res, 200, true, "Username updated successfully", user);
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    const {user, token} = await userService.changePassword({ userId, currentPassword, newPassword });

    return sendResponse(res, 200, true, "Password updated successfully", {user, token});
  }),

  deleteProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    await userService.deleteProfile({ userId });

    return sendResponse(res, 204, true, "Account deleted Successfully");
  }),

  changeDailyHours: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { newDailyHours } = req.body;
    const { user } = await userService.changeDailyHours({
      newDailyHours,
      userId,
    });

    return sendResponse(
      res,
      200,
      true,
      "DailyHours updated Successfully",
      user,
    );
  }),

  changeEmail: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user._id;
    const { newEmail } = req.body;
    const { user } = await userService.changeEmail({ newEmail, userId });

    return sendResponse(
      res,
      200,
      true,
      "Email updated Successfully",
      user,
    );
  }),
};

export default userController;
