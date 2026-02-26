// models/LoanApplication.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILoanApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  dob: Date;
  gender: string;
  idNumber: string;
  address: string;
  loanType: string;
  loanAmount: number;
  purpose: string;
  tenure: number;
  employment: string;
  income: number;
  businessName?: string;
  yearsInBusiness?: number;
  employees?: number;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  documents: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loanApplicationSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    idNumber: { type: String, required: true },
    address: { type: String, required: true },
    loanType: { type: String, required: true },
    loanAmount: { type: Number, required: true },
    purpose: { type: String, required: true },
    tenure: { type: Number, required: true },
    employment: { type: String, required: true },
    income: { type: Number, required: true },
    businessName: String,
    yearsInBusiness: Number,
    employees: Number,
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    documents: [String],
    notes: String,
  },
  { timestamps: true }
);

export const LoanApplication =
  mongoose.models.LoanApplication ||
  mongoose.model<ILoanApplication>('LoanApplication', loanApplicationSchema);