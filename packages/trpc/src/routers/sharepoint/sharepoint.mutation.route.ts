import { router } from "../../trpc";
import { protectedProcedure } from "../../middleware";
import { z } from "zod";
import {
  uploadFileSchema,
  deleteFileSchema,
  createFolderSchema,
  createUploadSessionSchema,
} from "./sharepoint.schema";
import {
  getSharePointConfig,
  isSharePointConfigured,
} from "./sharepoint.config";
import { createSharePointService } from "./sharepoint.service";
import {
  createSharePointError,
  createServiceUnavailableError,
} from "../../errors";

/**
 * SharePoint mutation router - file write operations
 */
export const sharePointMutationRouter = router({
  /**
   * Upload a file to SharePoint
   * Expects base64 encoded content
   */
  uploadFile: protectedProcedure
    .input(uploadFileSchema)
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

        // Decode base64 content
        const buffer = Buffer.from(input.content, "base64");

        const file = await service.uploadFile(
          input.folderPath,
          input.fileName,
          buffer,
          { conflictBehavior: input.conflictBehavior }
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

  /**
   * Delete a file from SharePoint
   */
  deleteFile: protectedProcedure
    .input(deleteFileSchema)
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

  /**
   * Create a folder in SharePoint
   */
  createFolder: protectedProcedure
    .input(createFolderSchema)
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
        const folder = await service.createFolder(
          input.parentPath,
          input.folderName
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

  /**
   * Create an upload session for a file
   */
  createUploadSession: protectedProcedure
    .input(createUploadSessionSchema)
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
          input.conflictBehavior
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

  /**
   * Create a public sharing link for a file
   */
  createPublicLink: protectedProcedure
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
