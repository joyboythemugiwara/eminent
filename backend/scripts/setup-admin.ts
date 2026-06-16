import pool from "../src/config/database";
import { hashPassword } from "../src/utils/helpers";
import "dotenv/config";

const setupAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "mugi@eminentutorials.com";
    const password = process.env.ADMIN_PASSWORD || "admin@123"; // Change in production!

    console.log(`Setting up admin account: ${email}`);

    const passwordHash = await hashPassword(password);

    // Check if admin already exists
    const existing = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      console.log("Admin account already exists. Skipping...");
      process.exit(0);
    }

    // Create admin account
    const result = await pool.query(
      "INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash]
    );

    console.log("✓ Admin account created:");
    console.log(`  Email: ${result.rows[0].email}`);
    console.log(`  Created at: ${result.rows[0].created_at}`);
    console.log("\n⚠️  Change the admin password in production!");

    process.exit(0);
  } catch (error) {
    console.error("Error setting up admin:", error);
    process.exit(1);
  }
};

setupAdmin();
