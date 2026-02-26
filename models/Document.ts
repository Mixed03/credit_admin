// models/Document.ts - FILE UPLOAD MODEL
import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    // Reference Information
    relatedTo: {
      type: String,
      required: true,
      enum: ['Application', 'Product', 'User', 'Branch', 'Other'],
    },
    relatedId: {
      type: String,
      required: true,
      index: true,
    },
    
    // File Information
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Storage Information
    filePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    storageType: {
      type: String,
      enum: ['local', 's3', 'cloudinary'],
      default: 'local',
    },
    
    // Metadata
    category: {
      type: String,
      enum: [
        'ID Document',
        'Income Proof',
        'Bank Statement',
        'Business License',
        'Tax Document',
        'Property Document',
        'Photo',
        'Other'
      ],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    
    // Upload Information
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedByName: {
      type: String,
      trim: true,
    },
    
    // Status
    status: {
      type: String,
      enum: ['Active', 'Archived', 'Deleted'],
      default: 'Active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
DocumentSchema.index({ relatedTo: 1, relatedId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ createdAt: -1 });

// Virtual for file size in MB
DocumentSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Method to mark as verified
DocumentSchema.methods.markAsVerified = function(userId: string) {
  this.verified = true;
  this.verifiedBy = userId;
  this.verifiedAt = new Date();
  return this.save();
};

// Method to archive
DocumentSchema.methods.archive = function() {
  this.status = 'Archived';
  return this.save();
};

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);