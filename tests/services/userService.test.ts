import { describe, it, expect, vi, beforeEach } from "vitest";
import userService from "../../src/services/userService";
import User from "../../src/models/User";
import { AppError } from "../../src/utils/AppError";
import * as compareUtils from "../../src/utils/comparePassword";
import * as hashUtils from "../../src/utils/hashPassword";

vi.mock("../../src/models/User");
vi.mock("../../src/utils/comparePassword");
vi.mock("../../src/utils/hashPassword");

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("userProfile", () => {
    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "john_doe",
      email: "john@example.com",
      dailyStudyHours: 5,
    };

    it("should return user profile with valid userId", async () => {
      vi.mocked(User.findById).mockResolvedValueOnce(mockUser as any);

      const result = await userService.userProfile({
        userId: "507f1f77bcf86cd799439011",
      });

      expect(result.user.name).toBe("john_doe");
      expect(result.user.email).toBe("john@example.com");
    });

    it("should throw 401 Unauthorized if userId is empty", async () => {
      try {
        await userService.userProfile({ userId: "" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it("should throw 404 error if user not found", async () => {
      vi.mocked(User.findById).mockResolvedValueOnce(null);

      try {
        await userService.userProfile({ userId: "invalid_id" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("changeUserName", () => {
    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "john_doe",
      email: "john@example.com",
    };

    const mockUpdatedUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "john_updated",
      email: "john@example.com",
    };

    it("should update username successfully", async () => {
      vi.mocked(User.findById).mockResolvedValueOnce(mockUser as any);
      vi.mocked(User.findByIdAndUpdate).mockResolvedValueOnce(
        mockUpdatedUser as any,
      );

      const result = await userService.changeUserName({
        userId: "507f1f77bcf86cd799439011",
        name: "john_updated",
      });

      expect(result.user.name).toBe("john_updated");
    });

    it("should throw 401 Unauthorized if userId is empty", async () => {
      try {
        await userService.changeUserName({ userId: "", name: "new_name" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it("should throw 400 error if username is empty", async () => {
      try {
        await userService.changeUserName({
          userId: "507f1f77bcf86cd799439011",
          name: "",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it("should throw 404 error if user not found", async () => {
      vi.mocked(User.findById).mockResolvedValueOnce(null);

      try {
        await userService.changeUserName({
          userId: "507f1f77bcf86cd799439011",
          name: "new_name",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });

  describe("changePassword", () => {
    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "john_doe",
      email: "john@example.com",
      password: "hashed_old_password",
    };

    it("should change password successfully", async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      } as any);
      vi.mocked(compareUtils.comparePassword)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      vi.mocked(hashUtils.hashPassword).mockResolvedValueOnce(
        "hashed_new_password",
      );
      vi.mocked(User.updateOne).mockResolvedValueOnce({ ok: 1 } as any);

      await expect(
        userService.changePassword({
          userId: "507f1f77bcf86cd799439011",
          currentPassword: "password123",
          newPassword: "newPassword456",
        }),
      ).resolves.not.toThrow();
    });

    it("should throw 401 Unauthorized if userId is empty", async () => {
      try {
        await userService.changePassword({
          userId: "",
          currentPassword: "current",
          newPassword: "new",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(401);
      }
    });

    it("should throw 400 error if password fields are missing", async () => {
      try {
        await userService.changePassword({
          userId: "507f1f77bcf86cd799439011",
          currentPassword: "",
          newPassword: "newPassword456",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it("should throw 400 error if current password is incorrect", async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      } as any);
      vi.mocked(compareUtils.comparePassword).mockResolvedValueOnce(false);

      try {
        await userService.changePassword({
          userId: "507f1f77bcf86cd799439011",
          currentPassword: "wrongPassword",
          newPassword: "newPassword456",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
      }
    });

    it("should throw 400 error if new password is same as old", async () => {
      vi.mocked(User.findById).mockReturnValue({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      } as any);
      vi.mocked(compareUtils.comparePassword)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      try {
        await userService.changePassword({
          userId: "507f1f77bcf86cd799439011",
          currentPassword: "password123",
          newPassword: "password123",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(400);
      }
    });
  });

  describe("deleteProfile", () => {
    it("should delete user profile", async () => {
      vi.mocked(User.deleteOne).mockResolvedValueOnce({
        deletedCount: 1,
      } as any);

      await expect(
        userService.deleteProfile({ userId: "507f1f77bcf86cd799439011" }),
      ).resolves.not.toThrow();
    });

    it("should throw 404 error if userId is empty", async () => {
      try {
        await userService.deleteProfile({ userId: "" });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(404);
      }
    });
  });
});
