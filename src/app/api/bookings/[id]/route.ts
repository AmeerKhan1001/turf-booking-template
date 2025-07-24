import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await storage.getBookingById(id);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    await storage.deleteBooking(id);
    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ message: "Error deleting booking" }, { status: 500 });
  }
}