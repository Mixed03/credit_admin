// app/api/upload/route.ts - MERGED UPLOAD API ENDPOINT
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Document from '@/models/Document';
import { saveFileToDisk, ALLOWED_FILE_TYPES } from '@/lib/upload-utils';
import cloudinary from '@/lib/cloudinary';

// POST - Upload file(s) - Handles both Cloudinary images and document uploads
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Check if this is a single file upload for Cloudinary (e.g., profile images)
    const singleFile = formData.get('file') as File | null;
    const uploadType = formData.get('uploadType') as string; // 'cloudinary' or 'document'
    
    // Handle Cloudinary image upload (for profile pictures, etc.)
    if (singleFile && (!uploadType || uploadType === 'cloudinary')) {
      return await handleCloudinaryUpload(singleFile);
    }
    
    // Handle document upload (existing functionality)
    return await handleDocumentUpload(formData);
    
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload' },
      { status: 500 }
    );
  }
}

// Cloudinary upload handler for images (profile pictures, etc.)
async function handleCloudinaryUpload(file: File) {
  try {
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed for Cloudinary upload' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'ndtmfi/leadership', // Organized folder
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop
        { quality: 'auto', fetch_format: 'auto' } // Optimize
      ],
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Cloudinary upload failed' },
      { status: 500 }
    );
  }
}

// Document upload handler (existing functionality)
async function handleDocumentUpload(formData: FormData) {
  try {
    await dbConnect();

    const files = formData.getAll('files') as File[];
    const relatedTo = formData.get('relatedTo') as string;
    const relatedId = formData.get('relatedId') as string;
    const category = formData.get('category') as string || 'Other';
    const description = formData.get('description') as string || '';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (!relatedTo || !relatedId) {
      return NextResponse.json(
        { error: 'relatedTo and relatedId are required' },
        { status: 400 }
      );
    }

    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        // Save file to disk
        const result = await saveFileToDisk(file, {
          allowedTypes: ALLOWED_FILE_TYPES.all,
          generateUniqueName: true,
        });

        if (!result.success) {
          errors.push({
            fileName: file.name,
            error: result.error,
          });
          continue;
        }

        // Save document record to database
        const document = await Document.create({
          relatedTo,
          relatedId,
          fileName: result.fileName,
          originalName: result.originalName,
          fileType: file.type.split('/')[1] || 'unknown',
          fileSize: result.fileSize,
          mimeType: result.mimeType,
          filePath: result.filePath,
          fileUrl: result.fileUrl,
          storageType: 'local',
          category,
          description,
          status: 'Active',
        });

        uploadResults.push({
          success: true,
          document: {
            _id: document._id,
            fileName: document.fileName,
            originalName: document.originalName,
            fileUrl: document.fileUrl,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
            category: document.category,
          },
        });
      } catch (error: any) {
        errors.push({
          fileName: file.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: uploadResults.length > 0,
      uploads: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully uploaded ${uploadResults.length} of ${files.length} files`,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload documents' },
      { status: 500 }
    );
  }
}

// GET - Get documents by related entity
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const relatedTo = searchParams.get('relatedTo');
    const relatedId = searchParams.get('relatedId');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'Active';

    const query: any = { status };

    if (relatedTo) query.relatedTo = relatedTo;
    if (relatedId) query.relatedId = relatedId;
    if (category) query.category = category;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(documents);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}