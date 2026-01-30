"use client";

import React, { useRef, useCallback } from "react";
import { Upload, X, FileText, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface DeferredFilePickerProps {
  /** Callback when file is selected */
  onFileSelect: (file: File | null) => void;
  /** The currently selected file */
  selectedFile: File | null;
  /** Whether the file has been uploaded */
  isUploaded?: boolean;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Whether delete is in progress */
  isDeleting?: boolean;
  /** Callback to delete the uploaded file */
  onDelete?: () => void;
  /** URL of the uploaded file (for viewing) */
  uploadedUrl?: string;
  /** Label for the picker */
  label?: string;
  /** Allowed file extensions (e.g., ['.pdf', '.docx']) */
  allowedExtensions?: string[];
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Additional className */
  className?: string;
  /** Helper text to display */
  helperText?: string;
}

/**
 * A file picker component that allows selecting a file without immediate upload.
 * Designed to work with the useSharePointUpload hook for deferred upload on form submission.
 *
 * @example
 * ```tsx
 * const { selectedFile, selectFile, isUploading, progress, uploadedFile } = useSharePointUpload({...});
 *
 * <DeferredFilePicker
 *   selectedFile={selectedFile}
 *   onFileSelect={selectFile}
 *   isUploading={isUploading}
 *   uploadProgress={progress}
 *   isUploaded={!!uploadedFile}
 * />
 * ```
 */
const DeferredFilePicker: React.FC<DeferredFilePickerProps> = ({
  onFileSelect,
  selectedFile,
  isUploaded = false,
  uploadProgress = 0,
  isUploading = false,
  isDeleting = false,
  onDelete,
  uploadedUrl,
  label = "Select Document",
  allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
  maxSizeMB = 50,
  className,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      // Validate size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`File size must be less than ${maxSizeMB}MB`);
        return false;
      }

      // Validate extension
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error(
          `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
        );
        return false;
      }

      return true;
    },
    [allowedExtensions, maxSizeMB],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files?.[0];
      if (file && validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, validateFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClear = useCallback(() => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onFileSelect]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onDelete]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className='text-sm font-medium text-gray-700'>{label}</div>

      {!selectedFile ? (
        // Empty state - show dropzone
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className='border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-all'>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            className='hidden'
            accept={allowedExtensions.join(",")}
          />
          <Upload className='h-8 w-8 text-gray-400 mb-2' />
          <p className='text-sm text-gray-500 font-medium'>
            Click or drag file to select
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            Max size: {maxSizeMB}MB. Allowed: {allowedExtensions.join(" ")}
          </p>
        </div>
      ) : (
        // File selected state
        <div className='border border-gray-200 rounded-lg p-4 bg-white shadow-sm'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center space-x-3 overflow-hidden flex-1'>
              <div
                className={cn(
                  "p-2 rounded-full",
                  isUploaded ? "bg-green-100" : "bg-primary/10",
                )}>
                {isUploading ? (
                  <Loader2 className='h-5 w-5 text-primary animate-spin' />
                ) : isUploaded ? (
                  <CheckCircle className='h-5 w-5 text-green-600' />
                ) : (
                  <FileText className='h-5 w-5 text-primary' />
                )}
              </div>
              <div className='truncate flex-1'>
                <p className='text-sm font-medium truncate'>
                  {selectedFile.name}
                </p>
                <p className='text-xs text-gray-500'>
                  {formatFileSize(selectedFile.size)}
                  {isUploaded && (
                    <span className='text-green-600 ml-2'>• Uploaded</span>
                  )}
                </p>
              </div>
            </div>

            <div className='shrink-0 ml-2'>
              {!isUploading && !isDeleting && !isUploaded && (
                <Button
                  size='sm'
                  variant='ghost'
                  type='button'
                  onClick={handleClear}
                  className='h-8 w-8 p-0 text-gray-500 hover:text-red-500'>
                  <X className='h-4 w-4' />
                </Button>
              )}
              {isUploaded && !isDeleting && (
                <CheckCircle className='h-5 w-5 text-green-500' />
              )}
            </div>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className='space-y-1'>
              <Progress
                value={uploadProgress}
                className='h-2'
              />
              <p className='text-xs text-gray-500 text-center'>
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {/* Deleting state */}
          {isDeleting && (
            <div className='flex items-center justify-center py-2'>
              <Loader2 className='h-4 w-4 animate-spin mr-2 text-red-500' />
              <p className='text-xs text-red-500'>Deleting...</p>
            </div>
          )}

          {/* Pending upload message */}
          {!isUploading && !isUploaded && !isDeleting && (
            <p className='text-xs text-amber-600 mt-2 flex items-center'>
              <span className='inline-block w-2 h-2 bg-amber-500 rounded-full mr-2' />
              File will be uploaded when you submit the form
            </p>
          )}

          {/* Uploaded state actions */}
          {isUploaded && !isDeleting && (
            <div className='mt-2 flex gap-2'>
              {uploadedUrl && (
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  className='flex-1'
                  onClick={() => window.open(uploadedUrl, "_blank")}>
                  View File
                </Button>
              )}
              {onDelete && (
                <Button
                  variant='destructive'
                  size='sm'
                  type='button'
                  className='flex-1'
                  onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && <p className='text-xs text-gray-500'>{helperText}</p>}
    </div>
  );
};

export default DeferredFilePicker;
