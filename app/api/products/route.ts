// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { LoanProduct } from '@/models/LoanProduct';

// GET all products
export async function GET() {
  try {
    await dbConnect();
    const products = await LoanProduct.find({ status: 'Active' });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();

    const product = new LoanProduct(data);
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}