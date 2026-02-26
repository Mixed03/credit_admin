// models/Leadership.ts (UPDATED)
import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadership extends Document {
  name: string;
  role: string;
  department: string;
  bio: string;
  imageUrl: string; // NEW FIELD
  imagePublicId: string; // NEW FIELD - for Cloudinary deletion
  order: number;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const leadershipSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    bio: { type: String },
    imageUrl: { type: String, default: '' }, // NEW
    imagePublicId: { type: String, default: '' }, // NEW
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const Leadership =
  mongoose.models.Leadership ||
  mongoose.model<ILeadership>('Leadership', leadershipSchema);