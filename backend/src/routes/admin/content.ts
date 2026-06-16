import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { slugify, successResponse, errorResponse } from "../../utils/helpers";
import {
  generatePresignedUploadUrl,
  deleteFileFromR2,
  generateFileKey,
} from "../../config/r2";

const contentRouter = Router();
contentRouter.use(authMiddleware);

// Get dashboard stats
contentRouter.get("/dashboard/stats", async (req: Request, res: Response) => {
  try {
    const classesResult = await pool.query("SELECT COUNT(*) FROM classes");
    const subjectsResult = await pool.query("SELECT COUNT(*) FROM subjects");
    const chaptersResult = await pool.query("SELECT COUNT(*) FROM chapters");
    const notesResult = await pool.query("SELECT COUNT(*) FROM notes");
    const filesizeResult = await pool.query(
      "SELECT COALESCE(SUM(file_size_bytes), 0) as total FROM notes"
    );

    res.json(
      successResponse({
        classes: parseInt(classesResult.rows[0].count),
        subjects: parseInt(subjectsResult.rows[0].count),
        chapters: parseInt(chaptersResult.rows[0].count),
        notes: parseInt(notesResult.rows[0].count),
        totalFileSizeBytes: parseInt(filesizeResult.rows[0].total),
      })
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json(errorResponse("Failed to fetch stats"));
  }
});

// Create class
contentRouter.post("/classes", async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json(errorResponse("Class name is required"));
    }

    const slug = slugify(name);
    const result = await pool.query(
      "INSERT INTO classes (name, slug) VALUES ($1, $2) RETURNING id, name, slug, order_index, created_at",
      [name, slug]
    );

    res.status(201).json(successResponse(result.rows[0]));
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json(errorResponse("Class already exists"));
    }
    console.error("Error creating class:", error);
    res.status(500).json(errorResponse("Failed to create class"));
  }
});

// Update class
contentRouter.put("/classes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, order_index } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (order_index !== undefined) {
      updates.push(`order_index = $${paramCount++}`);
      values.push(order_index);
    }

    if (updates.length === 0) {
      return res.status(400).json(errorResponse("No fields to update"));
    }

    values.push(id);
    const query = `UPDATE classes SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Class not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json(errorResponse("Slug already exists"));
    }
    console.error("Error updating class:", error);
    res.status(500).json(errorResponse("Failed to update class"));
  }
});

// Delete class
contentRouter.delete("/classes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM classes WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Class not found"));
    }

    res.json(successResponse({ message: "Class deleted successfully" }));
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json(errorResponse("Failed to delete class"));
  }
});

// Get all subjects
contentRouter.get("/subjects/all", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, class_id, name, slug, icon, order_index, created_at FROM subjects ORDER BY class_id, order_index ASC"
    );
    res.json(successResponse(result.rows));
  } catch (error) {
    console.error("Error fetching all subjects:", error);
    res.status(500).json(errorResponse("Failed to fetch subjects"));
  }
});

// Create subject
contentRouter.post("/subjects", async (req: Request, res: Response) => {
  try {
    const { class_id, name, icon } = req.body;

    if (!class_id || !name) {
      return res
        .status(400)
        .json(errorResponse("Class ID and subject name are required"));
    }

    const slug = slugify(name);
    const result = await pool.query(
      "INSERT INTO subjects (class_id, name, slug, icon) VALUES ($1, $2, $3, $4) RETURNING id, class_id, name, slug, icon, order_index, created_at",
      [class_id, name, slug, icon || null]
    );

    res.status(201).json(successResponse(result.rows[0]));
  } catch (error: any) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json(errorResponse("Subject already exists for this class"));
    }
    console.error("Error creating subject:", error);
    res.status(500).json(errorResponse("Failed to create subject"));
  }
});

// Update subject
contentRouter.put("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, class_id, order_index } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (class_id !== undefined) {
      updates.push(`class_id = $${paramCount++}`);
      values.push(class_id);
    }
    if (order_index !== undefined) {
      updates.push(`order_index = $${paramCount++}`);
      values.push(order_index);
    }

    if (updates.length === 0) {
      return res.status(400).json(errorResponse("No fields to update"));
    }

    values.push(id);
    const query = `UPDATE subjects SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Subject not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json(errorResponse("Failed to update subject"));
  }
});

// Delete subject
contentRouter.delete("/subjects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM subjects WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Subject not found"));
    }

    res.json(successResponse({ message: "Subject deleted successfully" }));
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json(errorResponse("Failed to delete subject"));
  }
});

// Create chapter
contentRouter.post("/chapters", async (req: Request, res: Response) => {
  try {
    const { subject_id, name, chapter_number, description } = req.body;

    if (!subject_id || !name) {
      return res
        .status(400)
        .json(errorResponse("Subject ID and chapter name are required"));
    }

    const result = await pool.query(
      "INSERT INTO chapters (subject_id, name, chapter_number, description) VALUES ($1, $2, $3, $4) RETURNING id, subject_id, name, chapter_number, description, order_index, created_at",
      [subject_id, name, chapter_number || null, description || null]
    );

    res.status(201).json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json(errorResponse("Failed to create chapter"));
  }
});

// Get all chapters
contentRouter.get("/chapters/all", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ch.id, ch.name, ch.chapter_number, ch.description, ch.order_index, ch.subject_id, 
              s.name as subject_name, s.class_id, c.name as class_name
       FROM chapters ch
       JOIN subjects s ON ch.subject_id = s.id
       JOIN classes c ON s.class_id = c.id
       ORDER BY s.class_id, s.order_index, ch.order_index ASC`
    );
    res.json(successResponse(result.rows));
  } catch (error) {
    console.error("Error fetching all chapters:", error);
    res.status(500).json(errorResponse("Failed to fetch chapters"));
  }
});

// Update chapter
contentRouter.put("/chapters/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject_id, chapter_number, description, order_index } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (chapter_number !== undefined) {
      updates.push(`chapter_number = $${paramCount++}`);
      values.push(chapter_number);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (subject_id !== undefined) {
      updates.push(`subject_id = $${paramCount++}`);
      values.push(subject_id);
    }
    if (order_index !== undefined) {
      updates.push(`order_index = $${paramCount++}`);
      values.push(order_index);
    }

    if (updates.length === 0) {
      return res.status(400).json(errorResponse("No fields to update"));
    }

    values.push(id);
    const query = `UPDATE chapters SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Chapter not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error updating chapter:", error);
    res.status(500).json(errorResponse("Failed to update chapter"));
  }
});

// Delete chapter
contentRouter.delete("/chapters/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM chapters WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Chapter not found"));
    }

    res.json(successResponse({ message: "Chapter deleted successfully" }));
  } catch (error) {
    console.error("Error deleting chapter:", error);
    res.status(500).json(errorResponse("Failed to delete chapter"));
  }
});

// Presign URL for file upload
contentRouter.post(
  "/notes/presign",
  async (req: Request, res: Response) => {
    try {
      const { filename, contentType, classSlug, subjectSlug, chapterId } =
        req.body;

      if (!filename || !contentType || !chapterId) {
        return res.status(400).json(
          errorResponse(
            "filename, contentType, and chapterId are required"
          )
        );
      }

      // Generate file key based on hierarchy
      const fileKey = generateFileKey(
        classSlug || "uncategorized",
        subjectSlug || "uncategorized",
        chapterId,
        filename
      );

      // Generate presigned URL
      const presignedData = await generatePresignedUploadUrl(
        fileKey,
        contentType
      );

      res.json(successResponse(presignedData));
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json(errorResponse("Failed to generate upload URL"));
    }
  }
);

// Get all notes with hierarchy
contentRouter.get("/notes", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.title, n.file_url, n.file_key, n.file_size_bytes, n.uploaded_at,
              ch.name as chapter_name, s.name as subject_name, c.name as class_name
       FROM notes n
       JOIN chapters ch ON n.chapter_id = ch.id
       JOIN subjects s ON ch.subject_id = s.id
       JOIN classes c ON s.class_id = c.id
       ORDER BY n.uploaded_at DESC`
    );

    res.json(successResponse(result.rows));
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json(errorResponse("Failed to fetch notes"));
  }
});

// Create note
contentRouter.post("/notes", async (req: Request, res: Response) => {
  try {
    const { chapter_id, title, file_url, file_key, file_size_bytes } = req.body;

    if (!chapter_id || !title || !file_url || !file_key) {
      return res
        .status(400)
        .json(
          errorResponse(
            "Chapter ID, title, file_url, and file_key are required"
          )
        );
    }

    const result = await pool.query(
      "INSERT INTO notes (chapter_id, title, file_url, file_key, file_size_bytes) VALUES ($1, $2, $3, $4, $5) RETURNING id, chapter_id, title, file_url, file_key, file_size_bytes, uploaded_at, updated_at",
      [chapter_id, title, file_url, file_key, file_size_bytes || null]
    );

    res.status(201).json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json(errorResponse("Failed to create note"));
  }
});

// Update note
contentRouter.put("/notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, file_url, file_key, file_size_bytes } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (file_url !== undefined) {
      updates.push(`file_url = $${paramCount++}`);
      values.push(file_url);
    }
    if (file_key !== undefined) {
      updates.push(`file_key = $${paramCount++}`);
      values.push(file_key);
    }
    if (file_size_bytes !== undefined) {
      updates.push(`file_size_bytes = $${paramCount++}`);
      values.push(file_size_bytes);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      return res.status(400).json(errorResponse("No fields to update"));
    }

    values.push(id);
    const query = `UPDATE notes SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Note not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json(errorResponse("Failed to update note"));
  }
});

// Delete note
contentRouter.delete("/notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get note details before deletion (to get file_key for R2 cleanup)
    const getNoteResult = await pool.query(
      "SELECT file_key FROM notes WHERE id = $1",
      [id]
    );

    if (getNoteResult.rows.length === 0) {
      return res.status(404).json(errorResponse("Note not found"));
    }

    const fileKey = getNoteResult.rows[0].file_key;

    // Delete from database
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 RETURNING id",
      [id]
    );

    // Delete from R2 storage
    if (fileKey && process.env.R2_ACCESS_KEY_ID) {
      try {
        await deleteFileFromR2(fileKey);
      } catch (r2Error) {
        console.warn("Note deleted from DB but failed to delete from R2:", r2Error);
        // Continue anyway - file will be orphaned but note is deleted
      }
    }

    res.json(successResponse({ message: "Note deleted successfully" }));
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json(errorResponse("Failed to delete note"));
  }
});

// Reorder classes
contentRouter.patch(
  "/classes/reorder",
  async (req: Request, res: Response) => {
    try {
      const { items } = req.body; // [{ id, order_index }, ...]

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json(errorResponse("Items array is required"));
      }

      for (const item of items) {
        await pool.query("UPDATE classes SET order_index = $1 WHERE id = $2", [
          item.order_index,
          item.id,
        ]);
      }

      res.json(successResponse({ message: "Classes reordered successfully" }));
    } catch (error) {
      console.error("Error reordering classes:", error);
      res.status(500).json(errorResponse("Failed to reorder classes"));
    }
  }
);

// Reorder subjects
contentRouter.patch(
  "/subjects/reorder",
  async (req: Request, res: Response) => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json(errorResponse("Items array is required"));
      }

      for (const item of items) {
        await pool.query("UPDATE subjects SET order_index = $1 WHERE id = $2", [
          item.order_index,
          item.id,
        ]);
      }

      res.json(successResponse({ message: "Subjects reordered successfully" }));
    } catch (error) {
      console.error("Error reordering subjects:", error);
      res.status(500).json(errorResponse("Failed to reorder subjects"));
    }
  }
);

// Reorder chapters
contentRouter.patch(
  "/chapters/reorder",
  async (req: Request, res: Response) => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json(errorResponse("Items array is required"));
      }

      for (const item of items) {
        await pool.query(
          "UPDATE chapters SET order_index = $1 WHERE id = $2",
          [item.order_index, item.id]
        );
      }

      res.json(successResponse({ message: "Chapters reordered successfully" }));
    } catch (error) {
      console.error("Error reordering chapters:", error);
      res.status(500).json(errorResponse("Failed to reorder chapters"));
    }
  }
);

export default contentRouter;
