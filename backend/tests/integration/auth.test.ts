import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { initializeTestDatabase, closeTestDatabase } from "../fixtures/database";
import { loginAdmin, getOrCreateTestAdmin } from "../fixtures/helpers";
import { ApiResponse, LoginResponse, AdminResponse } from "../fixtures/types";

describe("Admin Authentication", () => {
  let adminToken: string;

  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  test("should create admin account and login", async () => {
    const { admin, password } = await getOrCreateTestAdmin(
      "test@admin.com",
      "test@123"
    );

    const loginResult = await loginAdmin("test@admin.com", "test@123");

    expect(loginResult.status).toBe(200);
    expect(loginResult.data.success).toBe(true);
    expect(loginResult.token).toBeDefined();
    expect(loginResult.data.data?.email).toBe("test@admin.com");

    adminToken = loginResult.token;
  });

  test("GET /api/v1/admin/auth/me should return current admin with token", async () => {
    const response = await fetch("http://localhost:3001/api/v1/admin/auth/me", {
      headers: {
        Cookie: `token=${adminToken}`,
      },
    });

    const data = (await response.json()) as ApiResponse<AdminResponse>;
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data?.email).toBe("test@admin.com");
  });

  test("should fail login with wrong password", async () => {
    const response = await fetch(
      "http://localhost:3001/api/v1/admin/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@admin.com",
          password: "wrong@123",
        }),
      }
    );

    const data = (await response.json()) as ApiResponse;
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error?.includes("Invalid")).toBe(true);
  });

  test("should fail login with non-existent email", async () => {
    const response = await fetch(
      "http://localhost:3001/api/v1/admin/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@admin.com",
          password: "test@123",
        }),
      }
    );

    const data = (await response.json()) as ApiResponse;
    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  test("should fail without token", async () => {
    const response = await fetch(
      "http://localhost:3001/api/v1/admin/auth/me"
    );

    expect(response.status).toBe(401);
  });

  test("should fail with invalid token", async () => {
    const response = await fetch(
      "http://localhost:3001/api/v1/admin/auth/me",
      {
        headers: {
          Cookie: "token=invalid.token.here",
        },
      }
    );

    expect(response.status).toBe(401);
  });
});
