import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Use the same schema as booking creation for validation
    const bookingInputSchema = z.object({
      customerName: z.string().min(1, "Customer name is required"),
      sport: z.string().min(1, "Sport is required"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
      startTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid start time (HH:MM)"),
      endTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid end time (HH:MM)"),
      duration: z.number().min(0.5).max(4),
      courtId: z.number().int().positive(),
      courtName: z.string(),
      price: z.number().int().positive(),
      peopleCount: z.number().int().positive("Number of people must be positive")
    });

    const validationResult = bookingInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        message: "Invalid booking data",
        errors: validationResult.error.format()
      }, { status: 400 });
    }

    const { date, startTime, duration, courtId } = validationResult.data;
    const [h, m] = startTime.split(":").map(Number);
    const slotStart = new Date(date + 'T' + startTime.padStart(5, '0') + ':00');
    const slotEnd = new Date(slotStart.getTime() + duration * 60 * 60 * 1000);

    // Only fetch bookings for prev, current, and next day
    const bookingDate = new Date(date);
    const prevDay = new Date(bookingDate); prevDay.setDate(bookingDate.getDate() - 1);
    const nextDay = new Date(bookingDate); nextDay.setDate(bookingDate.getDate() + 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const prevDayStr = toDateStr(prevDay);
    const currDayStr = toDateStr(bookingDate);
    const nextDayStr = toDateStr(nextDay);

    const relevantBookings = await storage.getBookingsByCourtAndDates(
      courtId,
      [prevDayStr, currDayStr, nextDayStr]
    );

    // Find conflicts using absolute time windows
    const conflicts: any[] = [];
    for (const b of relevantBookings) {
      // Always use 24h format for start/end
      const bookingStart = new Date(b.date + 'T' + b.startTime.padStart(5, '0') + ':00');
      let bookingEnd = new Date(b.date + 'T' + b.endTime.padStart(5, '0') + ':00');
      // If endTime is less than or equal to startTime, it's an overnight booking
      if (bookingEnd <= bookingStart) {
        bookingEnd.setDate(bookingEnd.getDate() + 1);
      }

      // Check for overlap (slotStart < bookingEnd && slotEnd > bookingStart)
      if (slotStart < bookingEnd && slotEnd > bookingStart) {
        conflicts.push(b);
        continue;
      }
    }
    
    return NextResponse.json({ conflicts });
  } catch (error) {
    console.error("Error checking booking conflicts:", error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json({ message: `Error checking booking conflicts - ${errorMessage}` }, { status: 500 });
  }
}