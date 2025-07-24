import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    await requireAdmin();
    
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Invalid booking ID" }, { status: 400 });
    }

    const booking = await storage.getBookingById(id);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    const success = await storage.approveBooking(id);
    if (success) {
      return NextResponse.json({ message: "Booking approved successfully" });
    } else {
      return NextResponse.json({ message: "Could not approve booking" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error approving booking:", error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json({ message: `Error approving booking - ${errorMessage}` }, { status: 500 });
  }
}