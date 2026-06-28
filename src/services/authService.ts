import UserModel from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/hashPassword.js";
import { comparePassword } from "../utils/comparePassword.js";
import { generateToken } from "../utils/generateToken.js";
import { UserResource } from "../resources/userResource.js";

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
    const user = await UserModel.findOne({ email }).select('+password');
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
};

export default authService;
