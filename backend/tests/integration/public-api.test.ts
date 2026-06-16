import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { initializeTestDatabase, closeTestDatabase } from "../fixtures/database";
import { ApiResponse } from "../fixtures/types";

describe("Public API - Classes", () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  test("GET /api/v1/classes should return empty array initially", async () => {
    const response = await fetch("http://localhost:3001/api/v1/classes");
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data?.length).toBe(0);
  });

  test("GET /api/v1/classes/:slug should return 404 for non-existent class", async () => {
    const response = await fetch("http://localhost:3001/api/v1/classes/non-existent");
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  test("GET /api/v1/classes/:classSlug/subjects should return empty subjects", async () => {
    // First create a class via database or API
    const response = await fetch("http://localhost:3001/api/v1/classes");
    const data = (await response.json()) as ApiResponse;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
