import { router } from "../../trpc";
import { protectedProcedure, adminProcedure } from "../../middleware";
import { z } from "zod";
import { sharepointSchemas } from "@pkg/schema";
import {
  getSharePointConfig,
  isSharePointConfigured,
} from "./sharepoint.config";
import { createSharePointService } from "./sharepoint.service";
import {
  createSharePointError,
  createServiceUnavailableError,
  validationError,
} from "../../errors";

/** Allowed file extensions for SharePoint uploads */
const ALLOWED_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".csv", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".zip",
];

/** Reject paths containing traversal sequences */
const assertSafePath = (value: string, fieldName: string) => {
  if (value.includes("..") || value.includes("//") || /[<>:|?*]/.test(value)) {
    throw validationError(
      `Invalid ${fieldName}`,
      [{ field: fieldName, message: `${fieldName} contains invalid characters` }],
    );
  }
};

/** Return lowercased extension including the dot, e.g. ".pdf" */
const getExtension = (fileName: string) => {
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : "";
};

export const sharePointMutationRouter = router({
  uploadFile: protectedProcedure
    .input(sharepointSchemas.uploadFileSchema)
    .mutation(async ({ input, ctx }) => {
      // Security: validate file extension and path safety
      const ext = getExtension(input.fileName);
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw validationError(
          "File type not allowed",
          [{ field: "fileName", message: `"${ext}" files are not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` }],
        );
      }
      assertSafePath(input.fileName, "fileName");
      assertSafePath(input.folderPath, "folderPath");

      if (!isSharePointConfigured(ctx.appEnv)) {
        throw createServiceUnavailableError("SharePoint", {
          userMessage:
            "SharePoint is not configured. Please contact your administrator.",
          devMessage:
            "SharePoint credentials not found in environment variables",
        });
      }

      try {
        const config = getSharePointConfig(ctx.appEnv);
        const service = createSharePointService(config);

        // Decode base64 content
        const buffer = Buffer.from(input.content, "base64");

        const file = await service.uploadFile(
          input.folderPath,
          input.fileName,
          buffer,
          { conflictBehavior: input.conflictBehavior },
        );

        return {
          success: true,
          message: "File uploaded successfully",
          file,
        };
      } catch (error) {
        throw createSharePointError("upload", {
          devMessage:
            error instanceof Error ? error.message : "Unknown upload error",
          cause: error,
        });
      }
    }),

  deleteFile: protectedProcedure
    .input(sharepointSchemas.deleteFileSchema)
    .mutation(async ({ input, ctx }) => {
      if (!isSharePointConfigured(ctx.appEnv)) {
        throw createServiceUnavailableError("SharePoint", {
          userMessage:
            "SharePoint is not configured. Please contact your administrator.",
          devMessage:
            "SharePoint credentials not found in environment variables",
        });
      }

      try {
        const config = getSharePointConfig(ctx.appEnv);
        const service = createSharePointService(config);
        await service.deleteFile(input.fileId);

        return {
          success: true,
          message: "File deleted successfully",
        };
      } catch (error) {
        throw createSharePointError("upload", {
          userMessage: "Failed to delete the file. Please try again.",
          devMessage:
            error instanceof Error ? error.message : "Unknown delete error",
          cause: error,
        });
      }
    }),

  createFolder: protectedProcedure
    .input(sharepointSchemas.createFolderSchema)
    .mutation(async ({ input, ctx }) => {
      // Security: validate path safety
      assertSafePath(input.parentPath, "parentPath");
      assertSafePath(input.folderName, "folderName");

      if (!isSharePointConfigured(ctx.appEnv)) {
        throw createServiceUnavailableError("SharePoint", {
          userMessage:
            "SharePoint is not configured. Please contact your administrator.",
          devMessage:
            "SharePoint credentials not found in environment variables",
        });
      }

      try {
        const config = getSharePointConfig(ctx.appEnv);
        const service = createSharePointService(config);
        const folder = await service.createFolder(
          input.parentPath,
          input.folderName,
        );

        return {
          success: true,
          message: "Folder created successfully",
          folder,
        };
      } catch (error) {
        throw createSharePointError("upload", {
          userMessage: "Failed to create folder. Please try again.",
          devMessage:
            error instanceof Error
              ? error.message
              : "Unknown folder creation error",
          cause: error,
        });
      }
    }),

  createUploadSession: protectedProcedure
    .input(sharepointSchemas.createUploadSessionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!isSharePointConfigured(ctx.appEnv)) {
        throw createServiceUnavailableError("SharePoint", {
          userMessage:
            "SharePoint is not configured. Please contact your administrator.",
          devMessage:
            "SharePoint credentials not found in environment variables",
        });
      }

      try {
        const config = getSharePointConfig(ctx.appEnv);
        const service = createSharePointService(config);
        const session = await service.createUploadSession(
          input.folderPath,
          input.fileName,
          input.conflictBehavior,
        );

        return {
          success: true,
          ...session,
        };
      } catch (error) {
        throw createSharePointError("upload", {
          userMessage: "Failed to initialize file upload. Please try again.",
          devMessage:
            error instanceof Error
              ? error.message
              : "Failed to create upload session",
          cause: error,
        });
      }
    }),

  createPublicLink: adminProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!isSharePointConfigured(ctx.appEnv)) {
        throw createServiceUnavailableError("SharePoint", {
          userMessage:
            "SharePoint is not configured. Please contact your administrator.",
          devMessage:
            "SharePoint credentials not found in environment variables",
        });
      }

      try {
        const config = getSharePointConfig(ctx.appEnv);
        const service = createSharePointService(config);
        const webUrl = await service.createSharingLink(input.fileId);

        return {
          success: true,
          webUrl,
        };
      } catch (error) {
        throw createSharePointError("permission", {
          userMessage: "Failed to create sharing link. Please try again.",
          devMessage:
            error instanceof Error
              ? error.message
              : "Failed to create public link",
          cause: error,
        });
      }
    }),
});
