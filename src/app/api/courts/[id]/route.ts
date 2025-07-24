import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid court ID" }, { status: 400 });
    }

    const court = await storage.getCourtById(id);
    if (!court) {
      return NextResponse.json({ message: "Court not found" }, { status: 404 });
    }

    return NextResponse.json(court);
  } catch (error) {
    console.error("Error fetching court:", error);
    return NextResponse.json({ message: "Error fetching court" }, { status: 500 });
  }
}