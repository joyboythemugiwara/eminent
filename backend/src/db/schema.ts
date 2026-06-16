import pool from "../config/database";

const setupDatabase = async () => {
  try {
    console.log("Setting up database schema...");

    // Enable extensions
    await pool.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    await pool.query("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"");

    // Create classes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        order_index INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create subjects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        order_index INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(class_id, slug)
      )
    `);

    // Create chapters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        chapter_number INT,
        description TEXT,
        order_index INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        file_url TEXT NOT NULL,
        file_key TEXT NOT NULL,
        file_size_bytes BIGINT,
        uploaded_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(200) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_subjects_class_id ON subjects(class_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_chapter_id ON notes(chapter_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_classes_slug ON classes(slug)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug, class_id)`);

    // Add fuzzy search indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_classes_name_trgm ON classes USING gist (name gist_trgm_ops)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_subjects_name_trgm ON subjects USING gist (name gist_trgm_ops)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chapters_name_trgm ON chapters USING gist (name gist_trgm_ops)`);

    console.log("✓ Database schema created successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
};

export default setupDatabase;
