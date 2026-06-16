import pool from "../../src/config/database";
import { hashPassword } from "../../src/utils/helpers";

export const createTestAdmin = async (email: string, password: string) => {
  const hashedPassword = await hashPassword(password);
  const result = await pool.query(
    "INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    [email, hashedPassword]
  );
  return result.rows[0];
};

export const getOrCreateTestAdmin = async (
  email: string = "admin@test.com",
  password: string = "admin@123"
) => {
  let admin = await pool.query("SELECT id, email FROM admins WHERE email = $1", [email]);

  if (admin.rows.length === 0) {
    admin = await pool.query(
      "INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, await hashPassword(password)]
    );
  }

  return { admin: admin.rows[0], password };
};

export const loginAdmin = async (email: string, password: string) => {
  const response = await fetch("http://localhost:3001/api/v1/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as any;
  return {
    status: response.status,
    token: data.data?.token,
    data,
  };
};

export const createClass = async (name: string, token: string) => {
  const response = await fetch("http://localhost:3001/api/v1/admin/classes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = (await response.json()) as any;
  return {
    status: response.status,
    data: data.data,
    response: data,
  };
};

export const createSubject = async (
  classId: number,
  name: string,
  token: string,
  icon: string = "📚"
) => {
  const response = await fetch("http://localhost:3001/api/v1/admin/subjects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    body: JSON.stringify({ class_id: classId, name, icon }),
  });

  const data = (await response.json()) as any;
  return {
    status: response.status,
    data: data.data,
    response: data,
  };
};

export const createChapter = async (
  subjectId: number,
  name: string,
  token: string,
  chapterNumber: number = 1,
  description: string = "Test chapter"
) => {
  const response = await fetch("http://localhost:3001/api/v1/admin/chapters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    body: JSON.stringify({
      subject_id: subjectId,
      name,
      chapter_number: chapterNumber,
      description,
    }),
  });

  const data = (await response.json()) as any;
  return {
    status: response.status,
    data: data.data,
    response: data,
  };
};

export const createNote = async (
  chapterId: number,
  title: string,
  token: string,
  fileUrl: string = "https://cdn.example.com/notes/test.pdf",
  fileKey: string = "notes/test.pdf",
  fileSizeBytes: number = 2048576
) => {
  const response = await fetch("http://localhost:3001/api/v1/admin/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `token=${token}`,
    },
    body: JSON.stringify({
      chapter_id: chapterId,
      title,
      file_url: fileUrl,
      file_key: fileKey,
      file_size_bytes: fileSizeBytes,
    }),
  });

  const data = (await response.json()) as any;
  return {
    status: response.status,
    data: data.data,
    response: data,
  };
};
