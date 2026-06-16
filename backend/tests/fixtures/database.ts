import pool from "../../src/config/database";
import setupDatabase from "../../src/db/schema";

export const cleanupDatabase = async () => {
  try {
    await pool.query("DELETE FROM notes");
    await pool.query("DELETE FROM chapters");
    await pool.query("DELETE FROM subjects");
    await pool.query("DELETE FROM classes");
    await pool.query("DELETE FROM admins");
  } catch (error) {
    console.error("Cleanup error:", error);
  }
};

export const initializeTestDatabase = async () => {
  await setupDatabase();
  await cleanupDatabase();
};

export const closeTestDatabase = async () => {
  await cleanupDatabase();
  // We don't call pool.end() here anymore because other tests might still need it.
  // Bun will close the process and the pool when all tests are finished.
};

export const shutdownPool = async () => {
  await pool.end();
};

export const getPool = () => pool;
