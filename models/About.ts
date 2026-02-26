// models/About.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAbout extends Document {
  section: 'story' | 'vision' | 'mission' | 'values';
  title: string;
  content: string;
  order: number;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const aboutSchema = new Schema(
  {
    section: {
      type: String,
      enum: ['story', 'vision', 'mission', 'values'],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export const About =
  mongoose.models.About ||
  mongoose.model<IAbout>('About', aboutSchema);