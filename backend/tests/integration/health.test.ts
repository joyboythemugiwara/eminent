import { test, expect, describe } from "bun:test";

describe("Health Check", () => {
  test("should return health status", async () => {
    const response = await fetch("http://localhost:3001/health");
    const data = (await response.json()) as any;

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
  });
});
