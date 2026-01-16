import { z } from "zod";

/**
 * Schema for getting files
 */
export const getFilesSchema = z.object({
  folderPath: z.string().optional().default("/"),
  top: z.number().int().positive().max(1000).optional(),
  skip: z.number().int().nonnegative().optional(),
  orderBy: z.string().optional(),
});

/**
 * Schema for getting folders
 */
export const getFoldersSchema = z.object({
  folderPath: z.string().optional().default("/"),
});

/**
 * Schema for uploading a file
 */
export const uploadFileSchema = z.object({
  folderPath: z.string().min(1, "Folder path is required"),
  fileName: z.string().min(1, "File name is required"),
  content: z.string().min(1, "File content is required"), // Base64 encoded content
  conflictBehavior: z
    .enum(["fail", "replace", "rename"])
    .optional()
    .default("replace"),
});

/**
 * Schema for downloading a file
 */
export const downloadFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

/**
 * Schema for deleting a file
 */
export const deleteFileSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
});

/**
 * Schema for creating a folder
 */
export const createFolderSchema = z.object({
  parentPath: z.string().optional().default("/"),
  folderName: z.string().min(1, "Folder name is required"),
});

/**
 * Schema for creating an upload session
 */
export const createUploadSessionSchema = z.object({
  folderPath: z.string().min(1, "Folder path is required"),
  fileName: z.string().min(1, "File name is required"),
  conflictBehavior: z
    .enum(["fail", "replace", "rename"])
    .optional()
    .default("replace"),
});
