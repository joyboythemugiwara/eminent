import { beforeAll, afterAll } from "bun:test";
import { startServer } from "../src/index";
import { shutdownPool } from "./fixtures/database";

let server: any;

beforeAll(async () => {
  // Start the server once for all tests
  try {
    server = await startServer();
  } catch (error) {
    // If server is already running (e.g. from another test process), ignore
    if (!(error as any).message.includes("EADDRINUSE")) {
      throw error;
    }
  }
});

afterAll(async () => {
  if (server) {
    server.close();
  }
  // We don't call shutdownPool() here because it would kill the pool for subsequent test files
  // running in the same process.
});
