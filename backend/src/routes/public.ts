import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../config/database";
import { successResponse, errorResponse } from "../utils/helpers";

const publicRouter = Router();

// Get all classes with subject counts
publicRouter.get("/classes", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.order_index, COUNT(s.id)::int as subject_count
       FROM classes c
       LEFT JOIN subjects s ON c.id = s.class_id
       GROUP BY c.id
       ORDER BY c.order_index ASC`
    );
    res.json(successResponse(result.rows));
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json(errorResponse("Failed to fetch classes"));
  }
});

// Get class by slug with subjects
publicRouter.get("/classes/:slug/full", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Get class info
    const classResult = await pool.query(
      "SELECT id, name, slug, order_index FROM classes WHERE slug = $1",
      [slug]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json(errorResponse("Class not found"));
    }

    const classInfo = classResult.rows[0];

    // Get subjects
    const subjectsResult = await pool.query(
      `SELECT id, name, slug, icon, order_index 
       FROM subjects 
       WHERE class_id = $1
       ORDER BY order_index ASC`,
      [classInfo.id]
    );

    res.json(successResponse({
      ...classInfo,
      subjects: subjectsResult.rows
    }));
  } catch (error) {
    console.error("Error fetching full class data:", error);
    res.status(500).json(errorResponse("Failed to fetch class data"));
  }
});

// Get class by slug
publicRouter.get("/classes/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      "SELECT id, name, slug, order_index FROM classes WHERE slug = $1",
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Class not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error fetching class:", error);
    res.status(500).json(errorResponse("Failed to fetch class"));
  }
});

// Get subjects for a class
publicRouter.get(
  "/classes/:classSlug/subjects",
  async (req: Request, res: Response) => {
    try {
      const { classSlug } = req.params;
      const result = await pool.query(
        `SELECT s.id, s.name, s.slug, s.icon, s.order_index 
         FROM subjects s
         JOIN classes c ON s.class_id = c.id
         WHERE c.slug = $1
         ORDER BY s.order_index ASC`,
        [classSlug]
      );

      res.json(successResponse(result.rows));
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json(errorResponse("Failed to fetch subjects"));
    }
  }
);

// Get single subject
publicRouter.get(
  "/classes/:classSlug/subjects/:subjectSlug",
  async (req: Request, res: Response) => {
    try {
      const { classSlug, subjectSlug } = req.params;
      const result = await pool.query(
        `SELECT s.id, s.name, s.slug, s.icon, s.order_index
         FROM subjects s
         JOIN classes c ON s.class_id = c.id
         WHERE c.slug = $1 AND s.slug = $2`,
        [classSlug, subjectSlug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json(errorResponse("Subject not found"));
      }

      res.json(successResponse(result.rows[0]));
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json(errorResponse("Failed to fetch subject"));
    }
  }
);

// Get subject by ID with chapters and notes
publicRouter.get(
  "/subjects/:subjectId/full",
  async (req: Request, res: Response) => {
    try {
      const { subjectId } = req.params;

      // Get subject info
      const subjectResult = await pool.query(
        `SELECT s.id, s.name, s.slug, s.icon, s.class_id, c.name as class_name, c.slug as class_slug
         FROM subjects s
         JOIN classes c ON s.class_id = c.id
         WHERE s.id = $1`,
        [subjectId]
      );

      if (subjectResult.rows.length === 0) {
        return res.status(404).json(errorResponse("Subject not found"));
      }

      const subject = subjectResult.rows[0];

      // Get chapters
      const chaptersResult = await pool.query(
        `SELECT id, name, chapter_number, description, order_index 
         FROM chapters 
         WHERE subject_id = $1 
         ORDER BY order_index ASC`,
        [subjectId]
      );

      const chapters = chaptersResult.rows;

      // Get all notes for all chapters of this subject
      const notesResult = await pool.query(
        `SELECT n.id, n.chapter_id, n.title, n.file_url, n.file_size_bytes, n.uploaded_at
         FROM notes n
         JOIN chapters ch ON n.chapter_id = ch.id
         WHERE ch.subject_id = $1
         ORDER BY n.uploaded_at DESC`,
        [subjectId]
      );

      // Map notes to chapters
      const chaptersWithNotes = chapters.map(chapter => ({
        ...chapter,
        notes: notesResult.rows.filter(note => note.chapter_id === chapter.id)
      }));

      res.json(successResponse({
        ...subject,
        chapters: chaptersWithNotes
      }));
    } catch (error) {
      console.error("Error fetching full subject data:", error);
      res.status(500).json(errorResponse("Failed to fetch subject data"));
    }
  }
);

// Get chapters for a subject
publicRouter.get(
  "/subjects/:subjectId/chapters",
  async (req: Request, res: Response) => {
    try {
      const { subjectId } = req.params;
      const result = await pool.query(
        `SELECT id, name, chapter_number, description, order_index 
         FROM chapters 
         WHERE subject_id = $1 
         ORDER BY order_index ASC`,
        [subjectId]
      );

      res.json(successResponse(result.rows));
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json(errorResponse("Failed to fetch chapters"));
    }
  }
);

// Get chapter with its notes
publicRouter.get(
  "/chapters/:chapterId",
  async (req: Request, res: Response) => {
    try {
      const { chapterId } = req.params;
      const chapterResult = await pool.query(
        `SELECT id, name, chapter_number, description FROM chapters WHERE id = $1`,
        [chapterId]
      );

      if (chapterResult.rows.length === 0) {
        return res.status(404).json(errorResponse("Chapter not found"));
      }

      const notesResult = await pool.query(
        `SELECT id, title, file_url, file_size_bytes, uploaded_at, updated_at 
         FROM notes 
         WHERE chapter_id = $1 
         ORDER BY uploaded_at DESC`,
        [chapterId]
      );

      const chapter = chapterResult.rows[0];
      res.json(successResponse({ ...chapter, notes: notesResult.rows }));
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json(errorResponse("Failed to fetch chapter"));
    }
  }
);

// Get notes for a chapter
publicRouter.get(
  "/chapters/:chapterId/notes",
  async (req: Request, res: Response) => {
    try {
      const { chapterId } = req.params;
      const result = await pool.query(
        `SELECT id, title, file_url, file_size_bytes, uploaded_at, updated_at 
         FROM notes 
         WHERE chapter_id = $1 
         ORDER BY uploaded_at DESC`,
        [chapterId]
      );

      res.json(successResponse(result.rows));
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json(errorResponse("Failed to fetch notes"));
    }
    });

    // Get single note by ID with hierarchy info
publicRouter.get("/notes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT n.id, n.title, n.file_url, n.file_size_bytes, n.uploaded_at,
              ch.name as chapter_name, ch.id as chapter_id, ch.description as chapter_description,
              s.name as subject_name, s.id as subject_id,
              c.name as class_name, c.slug as class_slug
       FROM notes n
       JOIN chapters ch ON n.chapter_id = ch.id
       JOIN subjects s ON ch.subject_id = s.id
       JOIN classes c ON s.class_id = c.id
       WHERE n.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(errorResponse("Note not found"));
    }

    res.json(successResponse(result.rows[0]));
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json(errorResponse("Failed to fetch note"));
  }
});

// Global Search
publicRouter.get("/search", async (req: Request, res: Response) => {
try {
  const { q } = req.query;
  if (!q || typeof q !== "string" || q.length < 2) {
    return res.json(successResponse({ classes: [], subjects: [], chapters: [] }));
  }

  const [classes, subjects, chapters] = await Promise.all([
    // Search classes with similarity ranking
    pool.query(
      `SELECT id, name, slug, similarity(name, $1) as rank
       FROM classes 
       WHERE name % $1 OR slug % $1
       ORDER BY rank DESC
       LIMIT 5`,
      [q]
    ),
    // Search subjects with class info and similarity ranking
    pool.query(
      `SELECT s.id, s.name, s.slug, s.icon, c.slug as class_slug, c.name as class_name, similarity(s.name, $1) as rank
       FROM subjects s
       JOIN classes c ON s.class_id = c.id
       WHERE s.name % $1 OR s.slug % $1
       ORDER BY rank DESC
       LIMIT 5`,
      [q]
    ),
    // Search chapters with subject and class info and weighted similarity ranking
    pool.query(
      `SELECT ch.id, ch.name, ch.chapter_number, ch.description, s.id as subject_id, s.name as subject_name, c.slug as class_slug,
              GREATEST(similarity(ch.name, $1), similarity(COALESCE(ch.description, ''), $1) * 0.4) as rank
       FROM chapters ch
       JOIN subjects s ON ch.subject_id = s.id
       JOIN classes c ON s.class_id = c.id
       WHERE ch.name % $1 OR ch.description % $1
       ORDER BY rank DESC
       LIMIT 10`,
      [q]
    )
  ]);

  res.json(successResponse({
    classes: classes.rows,
    subjects: subjects.rows,
    chapters: chapters.rows
  }));
} catch (error) {
  console.error("Error performing search:", error);
  res.status(500).json(errorResponse("Search failed"));
}
});

    export default publicRouter;
