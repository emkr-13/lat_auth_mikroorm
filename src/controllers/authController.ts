import { db } from "../config/db";
import { User } from "../models/user"; // Ganti dengan entity MikroORM
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sendResponse } from "../utils/responseHelper";
import { generateJwtToken, generateRefreshToken } from "../utils/helper";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi input
    const { username, password } = req.body;

    if (!username || !password) {
      sendResponse(res, 400, "Username and password are required");
      return;
    }

    // Dapatkan EntityManager
    const orm = await db;
    const em = orm.em.fork();

    // Cari user berdasarkan username
    const user = await em.findOne(User, { username });

    // Jika user tidak ditemukan
    if (!user) {
      sendResponse(res, 401, "Invalid credentials");
      return;
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendResponse(res, 401, "Invalid credentials");
      return;
    }

    // Generate token
    let authToken: string, refreshToken: string | undefined;

    try {
      const jwtResponse = await generateJwtToken({ id: user.id });
      authToken = jwtResponse.token ?? "";
      const refreshTokenResponse = await generateRefreshToken({ id: user.id });
      refreshToken = refreshTokenResponse.token ?? "";

      if (!refreshToken) {
        throw new Error("Refresh token generation failed");
      }
    } catch (error) {
      console.error("JWT generation failed:", error);
      sendResponse(res, 501, "Token generation failed");
      return;
    }

    // Update refresh token di database
    try {
      user.refreshToken = refreshToken;
      user.refreshTokenExp = new Date(
        Date.now() + parseInt(process.env.REFRESH_TOKEN_EXP!) * 1000
      );
      await em.flush(); // Simpan perubahan ke database
    } catch (dbError) {
      console.error("Database update failed:", dbError);
      sendResponse(res, 500, "Failed to update refresh token");
      return;
    }

    sendResponse(res, 200, "Login successful", {
      token: authToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    sendResponse(res, 500, "An unexpected error occurred", error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ambil user ID dari request (dari middleware authenticate)
    const userId = (req as any).user?.id;

    if (!userId) {
      sendResponse(res, 400, "Unauthorized");
      return;
    }

    // Dapatkan EntityManager
    const orm = await db;
    const em = orm.em.fork();

    // Hapus refresh token dari database
    const user = await em.findOne(User, { id: userId });
    if (!user) {
      sendResponse(res, 404, "User not found");
      return;
    }

    user.refreshToken = undefined;
    user.refreshTokenExp = undefined;
    await em.flush(); // Simpan perubahan ke database

    sendResponse(res, 200, "Logout successful");
  } catch (error) {
    console.error("Error during logout:", error);
    sendResponse(res, 500, "Logout failed", error);
  }
};
