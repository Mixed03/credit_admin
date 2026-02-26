// lib/upload-utils.ts - FILE UPLOAD UTILITIES
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  all: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export interface UploadConfig {
  maxFileSize?: number;
  allowedTypes?: string[];
  uploadDir?: string;
  generateUniqueName?: boolean;
}

export interface UploadResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  originalName?: string;
  error?: string;
}

/**
 * Generate a unique filename
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${name}_${timestamp}_${random}${ext}`;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string, allowedTypes: string[] = ALLOWED_FILE_TYPES.all): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE): boolean {
  return size <= maxSize;
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
  };
  return extensions[mimeType] || '';
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(dir: string = UPLOAD_DIR): Promise<void> {
  try {
    if (!fs.existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
}

/**
 * Save file to disk
 */
export async function saveFileToDisk(
  file: File,
  config: UploadConfig = {}
): Promise<UploadResult> {
  try {
    const {
      maxFileSize = MAX_FILE_SIZE,
      allowedTypes = ALLOWED_FILE_TYPES.all,
      uploadDir = UPLOAD_DIR,
      generateUniqueName = true,
    } = config;

    // Validate file size
    if (!validateFileSize(file.size, maxFileSize)) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${maxFileSize / (1024 * 1024)}MB`,
      };
    }

    // Validate file type
    if (!validateFileType(file.type, allowedTypes)) {
      return {
        success: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Ensure upload directory exists
    await ensureUploadDir(uploadDir);

    // Generate filename
    const fileName = generateUniqueName 
      ? generateUniqueFileName(file.name)
      : file.name;

    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return {
      success: true,
      fileName,
      filePath,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
      originalName: file.name,
    };
  } catch (error: any) {
    console.error('Error saving file:', error);
    return {
      success: false,
      error: error.message || 'Failed to save file',
    };
  }
}

/**
 * Delete file from disk
 */
export async function deleteFileFromDisk(filePath: string): Promise<boolean> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get file info
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    extension: path.extname(file.name),
    sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
  };
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType: string): string {
  if (ALLOWED_FILE_TYPES.images.includes(mimeType)) return 'Image';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word')) return 'Word Document';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Spreadsheet';
  return 'Document';
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  config: UploadConfig = {}
): { valid: boolean; errors: string[] } {
  const {
    maxFileSize = MAX_FILE_SIZE,
    allowedTypes = ALLOWED_FILE_TYPES.all,
  } = config;

  const errors: string[] = [];

  files.forEach((file, index) => {
    if (!validateFileSize(file.size, maxFileSize)) {
      errors.push(`File ${index + 1} (${file.name}): Size exceeds ${maxFileSize / (1024 * 1024)}MB`);
    }
    if (!validateFileType(file.type, allowedTypes)) {
      errors.push(`File ${index + 1} (${file.name}): Type ${file.type} not allowed`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export constants
export { UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_FILE_TYPES };