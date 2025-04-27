import { db } from "../config/db";
import { User } from "../models/user"; // Ganti dengan entity MikroORM
import { sendResponse } from "../utils/responseHelper";
import { Request, Response } from "express";

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.id; // Ambil user ID dari token yang sudah diverifikasi

    if (!userId) {
      sendResponse(res, 400, "Unauthorized");
      return;
    }

    // Dapatkan EntityManager
    const orm = await db;
    const em = orm.em.fork();

    // Cari user berdasarkan ID
    const user = await em.findOne(User, { id: userId });

    // Jika user tidak ditemukan
    if (!user) {
      sendResponse(res, 404, "User not found");
      return;
    }

    // Kirim response dengan data user
    const dataUser = {
      username: user.username,
      userCreated: user.createdAt,
    };
    sendResponse(res, 200, "User profile retrieved successfully", dataUser);
  } catch (error) {
    console.error("Error retrieving profile:", error);
    sendResponse(res, 500, "Internal server error");
  }
};

export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id; // Ambil user ID dari token yang sudah diverifikasi

    if (!userId) {
      sendResponse(res, 400, "Unauthorized");
      return;
    }

    const { username } = req.body; // Ambil data dari request body

    // Validasi input
    if (!username) {
      sendResponse(res, 400, "Username is required");
      return;
    }

    // Dapatkan EntityManager
    const orm = await db;
    const em = orm.em.fork();

    // Cari user berdasarkan ID
    const user = await em.findOne(User, { id: userId });

    // Jika user tidak ditemukan
    if (!user) {
      sendResponse(res, 404, "User not found");
      return;
    }

    // Update username
    user.username = username;
    await em.flush(); // Simpan perubahan ke database

    // Kirim response sukses
    sendResponse(res, 200, "User updated successfully");
  } catch (error) {
    console.error("Error editing user:", error);
    sendResponse(res, 500, "Internal server error");
  }
};
