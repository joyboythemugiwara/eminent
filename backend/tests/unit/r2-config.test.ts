import { test, expect, describe } from "bun:test";
import r2Config from "../../src/config/r2";

describe("Cloudflare R2 Configuration", () => {
  test("should have R2 config available", () => {
    expect(r2Config).toBeDefined();
  });

  test("generateFileKey should create hierarchical path", () => {
    const fileKey = r2Config.generateFileKey(
      "class-6",
      "mathematics",
      1,
      "numbers.pdf"
    );

    expect(fileKey).toContain("notes/");
    expect(fileKey).toContain("class-6");
    expect(fileKey).toContain("mathematics");
    expect(fileKey).toContain("chapter-1");
    expect(fileKey).toContain("numbers.pdf");
  });

  test("generateFileKey should include timestamp for versioning", () => {
    const fileKey1 = r2Config.generateFileKey(
      "class-6",
      "mathematics",
      1,
      "numbers.pdf"
    );
    const fileKey2 = r2Config.generateFileKey(
      "class-6",
      "mathematics",
      1,
      "numbers.pdf"
    );

    // Keys should be different due to timestamp
    expect(fileKey1).not.toBe(fileKey2);
  });

  test("generateFileKey should handle special characters in filename", () => {
    const fileKey = r2Config.generateFileKey(
      "class-6",
      "mathematics",
      1,
      "numbers & sets (v2).pdf"
    );

    expect(fileKey).toContain("class-6");
    expect(fileKey).toContain("numbers");
  });

  test("should sanitize file paths correctly", () => {
    const fileKey = r2Config.generateFileKey(
      "class-6",
      "mathematics",
      1,
      "../../../etc/passwd"
    );

    // Should not contain path traversal attempts
    expect(fileKey).not.toContain("../");
    expect(fileKey).not.toContain("..");
  });
});
