// models/Branch.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    hours: { type: String, required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const Branch =
  mongoose.models.Branch ||
  mongoose.model<IBranch>('Branch', branchSchema);