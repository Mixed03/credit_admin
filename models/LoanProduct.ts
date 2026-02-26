// models/LoanProduct.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanProduct extends Document {
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  minInterest: number;
  maxInterest: number;
  processingFee: number;
  status: 'Active' | 'Inactive';
  features: string[];
  eligibility: string[];
  createdAt: Date;
  updatedAt: Date;
}

const loanProductSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    minTenure: { type: Number, required: true },
    maxTenure: { type: Number, required: true },
    minInterest: { type: Number, required: true },
    maxInterest: { type: Number, required: true },
    processingFee: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    features: [String],
    eligibility: [String],
  },
  { timestamps: true }
);

export const LoanProduct =
  mongoose.models.LoanProduct ||
  mongoose.model<ILoanProduct>('LoanProduct', loanProductSchema);