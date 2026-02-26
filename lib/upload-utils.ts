// lib/upload-utils.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

// File type configurations
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  all: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface SaveFileOptions {
  allowedTypes?: string[];
  maxSize?: number;
  generateUniqueName?: boolean;
}

interface SaveFileResult {
  success: boolean;
  fileName?: string;
  originalName?: string;
  filePath?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Generate a unique filename
 */
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitizedName}_${timestamp}_${randomString}${extension}`;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  return uploadDir;
}

/**
 * Save file to disk
 */
export async function saveFileToDisk(
  file: File,
  options: SaveFileOptions = {}
): Promise<SaveFileResult> {
  try {
    const {
      allowedTypes = ALLOWED_FILE_TYPES.all,
      maxSize = MAX_FILE_SIZE,
      generateUniqueName = true,
    } = options;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    // Validate file size
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`,
      };
    }

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();

    // Generate filename
    const fileName = generateUniqueName
      ? generateUniqueFileName(file.name)
      : file.name;

    // Full file path
    const filePath = path.join(uploadDir, fileName);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    await writeFile(filePath, buffer);

    // Generate URL
    const fileUrl = `/uploads/${fileName}`;

    return {
      success: true,
      fileName,
      originalName: file.name,
      filePath,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
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
    // Security check: ensure path is within uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const normalizedPath = path.normalize(filePath);
    
    if (!normalizedPath.startsWith(uploadDir)) {
      // If filePath is relative (like /uploads/file.pdf), convert to absolute
      const absolutePath = path.join(process.cwd(), 'public', filePath);
      const normalizedAbsPath = path.normalize(absolutePath);
      
      if (!normalizedAbsPath.startsWith(uploadDir)) {
        console.error('Invalid file path: outside uploads directory');
        return false;
      }
      
      await unlink(normalizedAbsPath);
      return true;
    }
    
    await unlink(normalizedPath);
    return true;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: { [key: string]: string } = {
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
  };

  return mimeToExt[mimeType] || '';
}

/**
 * Validate file
 */
export function validateFile(
  file: File,
  options: SaveFileOptions = {}
): { valid: boolean; error?: string } {
  const {
    allowedTypes = ALLOWED_FILE_TYPES.all,
    maxSize = MAX_FILE_SIZE,
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get file category from mime type
 */
export function getCategoryFromMimeType(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return 'Photo';
  } else if (mimeType === 'application/pdf') {
    return 'ID Document'; // Default PDF to ID Document
  } else if (
    mimeType.includes('word') ||
    mimeType.includes('document')
  ) {
    return 'Other';
  } else if (
    mimeType.includes('excel') ||
    mimeType.includes('sheet')
  ) {
    return 'Bank Statement'; // Default spreadsheets to bank statements
  }
  
  return 'Other';
}