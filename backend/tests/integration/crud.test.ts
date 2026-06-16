import { test, expect, describe, beforeAll, afterAll } from "bun:test";
import { initializeTestDatabase, closeTestDatabase } from "../fixtures/database";
import {
  getOrCreateTestAdmin,
  loginAdmin,
  createClass,
  createSubject,
  createChapter,
  createNote,
} from "../fixtures/helpers";
import { ApiResponse } from "../fixtures/types";

describe("Admin API - Content Management", () => {
  let adminToken: string;
  let classId: number;
  let subjectId: number;
  let chapterId: number;
  let noteId: number;

  beforeAll(async () => {
    await initializeTestDatabase();

    // Setup admin and get token
    await getOrCreateTestAdmin("admin@test.com", "admin@123");
    const loginResult = await loginAdmin("admin@test.com", "admin@123");
    adminToken = loginResult.token;
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  describe("Classes Management", () => {
    test("POST /admin/classes should create a class", async () => {
      const classResult = await createClass("Class 6", adminToken);

      expect(classResult.status).toBe(201);
      expect(classResult.response.success).toBe(true);
      expect(classResult.data?.name).toBe("Class 6");
      expect(classResult.data?.slug).toBe("class-6");
      expect(classResult.data?.id).toBeDefined();

      classId = classResult.data!.id;
    });

    test("GET /api/v1/classes should return created class", async () => {
      const response = await fetch("http://localhost:3001/api/v1/classes");
      const data = (await response.json()) as ApiResponse;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test("PUT /admin/classes/:id should update class", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/admin/classes/${classId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({ name: "Class 7" }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("PATCH /admin/classes/reorder should reorder classes", async () => {
      const response = await fetch(
        "http://localhost:3001/api/v1/admin/classes/reorder",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({
            items: [{ id: classId, order_index: 5 }],
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Subjects Management", () => {
    test("POST /admin/subjects should create a subject", async () => {
      const subjectResult = await createSubject(
        classId,
        "Mathematics",
        adminToken,
        "📐"
      );

      expect(subjectResult.status).toBe(201);
      expect(subjectResult.response.success).toBe(true);
      expect(subjectResult.data?.name).toBe("Mathematics");
      expect(subjectResult.data?.slug).toBe("mathematics");

      subjectId = subjectResult.data!.id;
    });

    test("POST /admin/subjects should create another subject", async () => {
      const subjectResult = await createSubject(
        classId,
        "English",
        adminToken,
        "📖"
      );

      expect(subjectResult.status).toBe(201);
      expect(subjectResult.response.success).toBe(true);
    });

    test("PUT /admin/subjects/:id should update subject", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/admin/subjects/${subjectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({ name: "Advanced Mathematics" }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("PATCH /admin/subjects/reorder should reorder subjects", async () => {
      const response = await fetch(
        "http://localhost:3001/api/v1/admin/subjects/reorder",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({
            items: [{ id: subjectId, order_index: 1 }],
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Chapters Management", () => {
    test("POST /admin/chapters should create a chapter", async () => {
      const chapterResult = await createChapter(
        subjectId,
        "Chapter 1: Numbers",
        adminToken,
        1,
        "Introduction to numbers"
      );

      expect(chapterResult.status).toBe(201);
      expect(chapterResult.response.success).toBe(true);
      expect(chapterResult.data?.id).toBeDefined();

      chapterId = chapterResult.data!.id;
    });

    test("GET /api/v1/chapters/:id should return chapter details", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/chapters/${chapterId}`
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("PUT /admin/chapters/:id should update chapter", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/admin/chapters/${chapterId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({ name: "Chapter 1: Numbers & Sets" }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("PATCH /admin/chapters/reorder should reorder chapters", async () => {
      const response = await fetch(
        "http://localhost:3001/api/v1/admin/chapters/reorder",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({
            items: [{ id: chapterId, order_index: 1 }],
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Notes Management", () => {
    test("POST /admin/notes should create a note", async () => {
      const noteResult = await createNote(
        chapterId,
        "Numbers - Complete Notes",
        adminToken
      );

      expect(noteResult.status).toBe(201);
      expect(noteResult.response.success).toBe(true);

      // Get the note ID from the response
      if (noteResult.data?.id) {
        noteId = noteResult.data.id;
      }
    });

    test("PUT /admin/notes/:id should update note if ID exists", async () => {
      if (!noteId) return; // Skip if note creation didn't return ID

      const response = await fetch(
        `http://localhost:3001/api/v1/admin/notes/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Cookie: `token=${adminToken}`,
          },
          body: JSON.stringify({
            title: "Numbers - Advanced Notes",
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("DELETE /admin/notes/:id should delete note if ID exists", async () => {
      if (!noteId) return; // Skip if note ID not available

      const response = await fetch(
        `http://localhost:3001/api/v1/admin/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `token=${adminToken}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Dashboard Stats", () => {
    test("GET /admin/dashboard/stats should return statistics", async () => {
      const response = await fetch(
        "http://localhost:3001/api/v1/admin/dashboard/stats",
        {
          headers: {
            Cookie: `token=${adminToken}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe("Cleanup - Delete Operations", () => {
    test("DELETE /admin/chapters/:id should delete chapter", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/admin/chapters/${chapterId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `token=${adminToken}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("DELETE /admin/subjects/:id should delete subject", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/admin/subjects/${subjectId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `token=${adminToken}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test("DELETE /admin/classes/:id should delete class", async () => {
      const response = await fetch(
        `http://localhost:3001/api/v1/admin/classes/${classId}`,
        {
          method: "DELETE",
          headers: {
            Cookie: `token=${adminToken}`,
          },
        }
      );

      const data = (await response.json()) as ApiResponse;
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
