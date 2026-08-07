import UserModel from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/hashPassword.js";
import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateToken.js";
import { UserResource } from "../resources/userResource.js";
import { sendEmail } from "../utils/sendEmail.js";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const authService = {
  register: async ({
    name,
    email,
    password,
    dailyStudyHours,
  }: {
    name: string;
    email: string;
    password: string;
    dailyStudyHours: number;
  }) => {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists", 400);
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      dailyStudyHours,
    });

    const token = generateToken({ _id: newUser.id });
    const formattedUser = new UserResource(newUser);

    return { token, user: formattedUser };
  },

  login: async ({ email, password }: { email: string; password: string }) => {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatchPassword = await comparePassword(password, user.password);
    if (!isMatchPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken({ _id: user.id });
    const formattedUser = new UserResource(user);

    return { token, user: formattedUser };
  },

  forgotPassword: async ({ email }: { email: string }) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const otp = generateOtp();
    const hashedOtp = await hashPassword(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await UserModel.updateOne(
      { email },
      {
        resetPasswordOtp: hashedOtp,
        resetPasswordOtpExpiry: otpExpiry,
      },
    );

    await sendEmail({
      to: email,
      subject: "Reset your Smart Study password",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });
  },

  verifyPassword: async ({
    email,
    otp,
    newPassword,
  }: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    const user = await UserModel.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordOtpExpiry",
    );
    if (!user || !user.resetPasswordOtp || !user.resetPasswordOtpExpiry) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    if (user.resetPasswordOtpExpiry < new Date()) {
      throw new AppError("OTP has expired", 400);
    }

    const isValidOtp = await comparePassword(otp, user.resetPasswordOtp);
    if (!isValidOtp) {
      throw new AppError("Invalid OTP", 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordOtp = undefined as any;
    user.resetPasswordOtpExpiry = undefined as any;
    await user.save();
  },

  resetPassword: async ({
    name,
    email,
    newPassword,
  }: {
    name: string;
    email: string;
    newPassword: string;
  }) => {
    const user = await UserModel.findOne({ email, name });
    if (!user) {
      throw new AppError("User Data not found", 404);
    }

    const hashedPassword = await hashPassword(newPassword);
    await UserModel.updateOne({ email, name }, { password: hashedPassword });
  },
};

export default authService;
