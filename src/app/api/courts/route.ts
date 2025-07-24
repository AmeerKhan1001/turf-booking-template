import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const duration = searchParams.get('duration');

    // Check if this is a request for available courts
    if (date && time && duration) {
      const querySchema = z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        time: z.string().regex(/^\d{1,2}:\d{2}$/),     // HH:MM
        duration: z.coerce.number().min(0.5).max(2)
      });

      const query = querySchema.safeParse({ date, time, duration: Number(duration) });

      if (!query.success) {
        return NextResponse.json({
          message: "Invalid query parameters",
          errors: query.error.format()
        }, { status: 400 });
      }

      const availableCourts = await storage.getAvailableCourts(
        query.data.date,
        query.data.time,
        query.data.duration
      );

      return NextResponse.json(availableCourts);
    }

    // Regular courts request
    const courts = await storage.getCourts();
    return NextResponse.json(courts);
  } catch (error) {
    console.error("Error fetching courts:", error);
    return NextResponse.json({ message: "Error fetching courts" }, { status: 500 });
  }
}