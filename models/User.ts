// models/User.ts - UPDATED VERSION
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'officer';
  status: 'Active' | 'Inactive';
  notificationSettings?: {
    emailNotifications: boolean;
    newApplications: boolean;
    statusUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
    monthlyDigest: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'officer'],
      default: 'officer',
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    notificationSettings: {
      type: {
        emailNotifications: { type: Boolean, default: true },
        newApplications: { type: Boolean, default: true },
        statusUpdates: { type: Boolean, default: true },
        systemAlerts: { type: Boolean, default: true },
        weeklyReports: { type: Boolean, default: false },
        monthlyDigest: { type: Boolean, default: true },
      },
      default: {
        emailNotifications: true,
        newApplications: true,
        statusUpdates: true,
        systemAlerts: true,
        weeklyReports: false,
        monthlyDigest: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster email lookups
UserSchema.index({ email: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);