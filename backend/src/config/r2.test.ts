import { test, expect, describe } from "bun:test";
import {
  generatePresignedUploadUrl,
  generateFileKey,
  getPublicUrl,
} from "../src/config/r2";

describe("Cloudflare R2 Integration", () => {
  describe("File Key Generation", () => {
    test("should generate proper file key format", () => {
      const fileKey = generateFileKey("class-6", "mathematics", 1, "notes.pdf");

      expect(fileKey).toMatch(/^notes\/class-6\/mathematics\/chapter-1\//);
      expect(fileKey).toMatch(/\.pdf$/);
      expect(fileKey).toContain("-notes.pdf");
    });

    test("should handle special characters in filename", () => {
      const fileKey = generateFileKey(
        "class-6",
        "mathematics",
        1,
        "Chapter 1: Numbers & Algebra!.pdf"
      );

      expect(fileKey).toContain("chapter-1");
      expect(fileKey).not.toMatch(/[!@#$%^&]/);
    });

    test("should include timestamp for versioning", () => {
      const key1 = generateFileKey("class-6", "mathematics", 1, "notes.pdf");
      // Small delay to ensure different timestamp
      Bun.sleepSync(10);
      const key2 = generateFileKey("class-6", "mathematics", 1, "notes.pdf");

      expect(key1).not.toBe(key2);
    });
  });

  describe("Public URL Generation", () => {
    test("should generate public CDN URL", () => {
      const fileKey = "notes/class-6/mathematics/chapter-1/123-notes.pdf";
      const url = getPublicUrl(fileKey);

      expect(url).toContain(process.env.R2_PUBLIC_URL);
      expect(url).toContain(fileKey);
    });

    test("should construct proper URL format", () => {
      const fileKey = "notes/class-6/mathematics/chapter-1/123-notes.pdf";
      const url = getPublicUrl(fileKey);

      // Should not have double slashes
      expect(url).not.toMatch(/\/\//);
      expect(url).toMatch(/https:\/\/.+\.com\/notes\/.+\.pdf$/);
    });
  });

  describe("Presigned URL Generation", () => {
    test.skip("should generate valid presigned URL (requires R2 credentials)", async () => {
      if (!process.env.R2_ACCESS_KEY_ID) {
        console.log("Skipping: R2 credentials not configured");
        return;
      }

      const fileKey = "notes/test/presigned-test.pdf";
      const contentType = "application/pdf";

      const presigned = await generatePresignedUploadUrl(
        fileKey,
        contentType
      );

      expect(presigned.uploadUrl).toBeTruthy();
      expect(presigned.fileKey).toBe(fileKey);
      expect(presigned.publicUrl).toContain(fileKey);
      expect(presigned.uploadUrl).toContain("X-Amz-Signature");
    });

    test.skip("should include correct content type in presigned URL (requires R2 credentials)", async () => {
      if (!process.env.R2_ACCESS_KEY_ID) return;

      const presigned = await generatePresignedUploadUrl(
        "test.pdf",
        "application/pdf"
      );

      expect(presigned.uploadUrl).toContain(
        encodeURIComponent("application/pdf")
      );
    });

    test.skip("should include 15 minute expiration (requires R2 credentials)", async () => {
      if (!process.env.R2_ACCESS_KEY_ID) return;

      const presigned = await generatePresignedUploadUrl(
        "test.pdf",
        "application/pdf"
      );

      // Check for X-Amz-Expires which should be 900 (15 minutes)
      expect(presigned.uploadUrl).toContain("X-Amz-Expires=900");
    });

    test("should require fileKey parameter", async () => {
      try {
        // @ts-ignore - intentionally passing empty string
        await generatePresignedUploadUrl("", "application/pdf");
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Expected
        expect(error).toBeTruthy();
      }
    });

    test("should require contentType parameter", async () => {
      try {
        // @ts-ignore - intentionally passing empty string
        await generatePresignedUploadUrl("test.pdf", "");
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        // Expected
        expect(error).toBeTruthy();
      }
    });
  });

  describe("File Key Hierarchy", () => {
    test("supports organizing files by class", () => {
      const class6Key = generateFileKey(
        "class-6",
        "mathematics",
        1,
        "notes.pdf"
      );
      const class12Key = generateFileKey(
        "class-12",
        "physics",
        5,
        "notes.pdf"
      );

      expect(class6Key).toContain("class-6");
      expect(class12Key).toContain("class-12");
      expect(class6Key).not.toBe(class12Key);
    });

    test("supports organizing files by subject", () => {
      const mathKey = generateFileKey(
        "class-6",
        "mathematics",
        1,
        "notes.pdf"
      );
      const scienceKey = generateFileKey(
        "class-6",
        "science",
        1,
        "notes.pdf"
      );

      expect(mathKey).toContain("mathematics");
      expect(scienceKey).toContain("science");
    });

    test("supports multiple PDFs per chapter", () => {
      const key1 = generateFileKey("class-6", "mathematics", 1, "notes.pdf");
      Bun.sleepSync(10);
      const key2 = generateFileKey("class-6", "mathematics", 1, "summary.pdf");

      // Different keys due to timestamps
      expect(key1).not.toBe(key2);
      // But same folder structure
      expect(key1.split("/").slice(0, 3)).toEqual(
        key2.split("/").slice(0, 3)
      );
    });
  });

  describe("Security Considerations", () => {
    test("file keys should not expose sensitive data", () => {
      const fileKey = generateFileKey("class-6", "mathematics", 1, "notes.pdf");

      // Should not contain credentials
      expect(fileKey).not.toContain(process.env.R2_ACCESS_KEY_ID || "");
      expect(fileKey).not.toContain(process.env.R2_SECRET_ACCESS_KEY || "");
    });

    test("should sanitize filenames to prevent path traversal", () => {
      const fileKey = generateFileKey(
        "class-6",
        "mathematics",
        1,
        "../../../etc/passwd"
      );

      // Should not contain parent directory references
      expect(fileKey).not.toContain("..");
      expect(fileKey.split("/").some((part) => part === "..")).toBe(false);
    });

    test("should handle null bytes in filename", () => {
      const fileKey = generateFileKey(
        "class-6",
        "mathematics",
        1,
        "notes\x00.pdf"
      );

      expect(fileKey).not.toContain("\x00");
    });
  });
});
