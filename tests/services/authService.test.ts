import { describe, beforeEach, it, expect, afterEach, vi } from "vitest";
import authService from "../../src/services/authService";
import UserModel from "../../src/models/User";
import { AppError } from "../../src/utils/AppError";
import * as passwordUtils from "../../src/utils/hashPassword";
import * as compareUtils from "../../src/utils/comparePassword";
import * as tokenUtils from "../../src/utils/generateToken";

vi.mock("../../src/models/User");
vi.mock("../../src/utils/hashPassword");
vi.mock("../../src/utils/comparePassword");
vi.mock("../../src/utils/generateToken");

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Register", () => {
    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "john_doe",
      email: "john@example.com",
      password: "hashed_password",
      id: "507f1f77bcf86cd799439011",
    };

    const registerData = {
      name: "john_doe",
      email: "john@example.com",
      password: "password123",
      dailyStudyHours: 6
    };

    it("should register user and return token with user data", async () => {
      vi.mocked(UserModel.findOne).mockResolvedValueOnce(null);
      vi.mocked(passwordUtils.hashPassword).mockResolvedValueOnce(
        "hashed_password",
      );
      vi.mocked(UserModel.create).mockResolvedValueOnce(mockUser as any);
      vi.mocked(tokenUtils.generateToken).mockReturnValueOnce("jwt_token_here");

      const result = await authService.register(registerData);

      expect(result.token).toBe("jwt_token_here");
      expect(result.user.name).toBe("john_doe");
      expect(result.user.email).toBe("john@example.com");
    });

    it("should throw 400 error if user already exists", async () => {
      const existingUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "john@example.com",
      };

      vi.mocked(UserModel.findOne).mockResolvedValueOnce(existingUser as any);

      try {
        await authService.register(registerData);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
        expect((error as AppError).message).toBe("User already exists");
      }
    });
  });

  describe("Login", () => {
    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "john_doe",
      email: "john@example.com",
      password: "hashed_password",
      id: "507f1f77bcf86cd799439011",
    };

    const loginData = {
      email: "john@example.com",
      password: "password123",
    };

    it("should login user and return token with user data", async () => {
      vi.mocked(UserModel.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      } as any);
      vi.mocked(compareUtils.comparePassword).mockResolvedValueOnce(true);
      vi.mocked(tokenUtils.generateToken).mockReturnValueOnce("jwt_token_here");

      const result = await authService.login(loginData);

      expect(result.token).toBe("jwt_token_here");
      expect(result.user.name).toBe("john_doe");
    });

    it("should throw 401 error if user not found", async () => {
      vi.mocked(UserModel.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(null),
      } as any);

      try {
        await authService.login(loginData);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it("should throw 401 error if password is incorrect", async () => {
      vi.mocked(UserModel.findOne).mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      } as any);
      vi.mocked(compareUtils.comparePassword).mockResolvedValueOnce(false);

      try {
        await authService.login(loginData);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });
  });
});
