import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../../config/database";
import { comparePassword } from "../../utils/helpers";
import { generateToken, authMiddleware } from "../../middleware/auth";
import { successResponse, errorResponse } from "../../utils/helpers";

const authRouter = Router();

// Admin login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(errorResponse("Email and password are required"));
    }

    const result = await pool.query(
      "SELECT id, email, password_hash FROM admins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json(errorResponse("Invalid email or password"));
    }

    const admin = result.rows[0];
    const passwordMatch = await comparePassword(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json(errorResponse("Invalid email or password"));
    }

    const token = generateToken(admin.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json(
      successResponse({
        id: admin.id,
        email: admin.email,
        token,
      })
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(errorResponse("Login failed"));
  }
});

// Admin logout
authRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json(successResponse({ message: "Logged out successfully" }));
});

// Get current admin info
authRouter.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, email, created_at FROM admins WHERE id = $1",
      [req.adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Admin not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error fetching admin info:", error);
    res.status(500).json(errorResponse("Failed to fetch admin info"));
  }
});

export default authRouter;
