import { Request, Response } from "express";
import userService from "../services/userService.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const userController = {
  userProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const { user } = await userService.userProfile({ userId });

    return res.status(200).json({ success: true, user });
  }),

  changeUserName: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const name = req.body.name;
    const { user } = await userService.changeUserName({ userId, name });

    return res.status(200).json({
      success: true,
      message: "Username updated successfully",
      user,
    });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword({ userId, currentPassword, newPassword });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  }),

  deleteProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!._id;
    await userService.deleteProfile({ userId });

    return res.status(204).json({});
  }),
};

export default userController;
