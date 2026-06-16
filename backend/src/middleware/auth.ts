import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      adminId?: number;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      adminId: number;
    };
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Invalid token",
    });
  }
};

export const generateToken = (adminId: number): string => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as any);
};
