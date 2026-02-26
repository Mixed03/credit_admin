// models/Job.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive';
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  openings: number;
  applicants: number;
  status: 'Active' | 'Inactive' | 'Closed';
  postedDate: Date;
  deadline?: Date;
  contactEmail: string;
  contactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
      default: 'Mid Level',
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    salaryMin: {
      type: Number,
      min: 0,
    },
    salaryMax: {
      type: Number,
      min: 0,
    },
    salaryCurrency: {
      type: String,
      default: 'LAK',
    },
    openings: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicants: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Closed'],
      default: 'Active',
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
JobSchema.index({ title: 1 });
JobSchema.index({ department: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ type: 1 });
JobSchema.index({ postedDate: -1 });

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);