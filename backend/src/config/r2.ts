import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

/**
 * Generate a presigned URL for uploading a file to R2
 * The URL is valid for 15 minutes
 */
export const generatePresignedUploadUrl = async (
  fileKey: string,
  contentType: string,
  fileSizeBytes?: number
): Promise<PresignedUrlResponse> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "eminent-tutorials",
      Key: fileKey,
      ContentType: contentType,
      ...(fileSizeBytes && { ContentLength: fileSizeBytes }),
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 15 * 60, // 15 minutes
    });

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate upload URL");
  }
};

/**
 * Delete a file from R2
 */
export const deleteFileFromR2 = async (fileKey: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "eminent-tutorials",
      Key: fileKey,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from R2:", error);
    throw new Error("Failed to delete file");
  }
};

/**
 * Get a public URL for an object in R2
 */
export const getPublicUrl = (fileKey: string): string => {
  return `${process.env.R2_PUBLIC_URL}/${fileKey}`;
};

/**
 * Generate a file key based on hierarchy
 */
import path from "path";

export const generateFileKey = (
  classSlug: string,
  subjectSlug: string,
  chapterId: number,
  filename: string
): string => {
  // Use basename to avoid directory traversal in filename
  const base = path.basename(filename || "file");

  // Preserve extension, sanitize base name
  const ext = path.extname(base);
  const nameWithoutExt = ext ? base.slice(0, -ext.length) : base;
  const sanitizedExt = ext.toLowerCase();

  const sanitizedBase = nameWithoutExt
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-") // allow dash and underscore
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes

  const sanitizedFilename = `${sanitizedBase}${sanitizedExt}` || `file${sanitizedExt}`;

  // Add low-collision suffix to ensure two rapid calls are unlikely to collide
  const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  return `notes/${classSlug}/${subjectSlug}/chapter-${chapterId}/${uniqueSuffix}-${sanitizedFilename}`;
};

const r2Config = {
  s3Client,
  generatePresignedUploadUrl,
  deleteFileFromR2,
  getPublicUrl,
  generateFileKey,
};

export default r2Config;
