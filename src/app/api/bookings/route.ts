import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { z } from 'zod';
import { format } from 'date-fns';
import camelcaseKeys from 'camelcase-keys';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dates = searchParams.get('dates');
    const status = searchParams.get('status');

    const querySchema = z.object({
      dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
      status: z.enum(["pending", "approved", "rejected"]).optional(),
    });

    const query = querySchema.safeParse({
      dates: dates ? JSON.parse(dates) : undefined,
      status: status || undefined
    });

    if (!query.success) {
      return NextResponse.json({
        message: "Invalid query parameters",
        errors: query.error.format()
      }, { status: 400 });
    }

    let rawBookings;
    let bookings;
    
    if (query.data.dates && query.data.dates.length > 0) {
      // TODO: Hardcoded court ID for now, should be dynamic based on user selection
      rawBookings = await storage.getBookingsByCourtAndDates(1, query.data.dates);
      bookings = camelcaseKeys(rawBookings);
      bookings = bookings.filter(booking => {
        // A booking is only relevant if its date exactly matches one of the queried dates
        return query.data.dates?.includes(booking.date);
      });
    } else {
      rawBookings = await storage.getAllBookings();
      bookings = camelcaseKeys(rawBookings);
    }

    // Filter by status if provided
    if (query.data.status) {
      if (query.data.status === "pending") {
        bookings = bookings.filter(booking => booking.isApproved === undefined || booking.isApproved === null);
      } else if (query.data.status === "approved") {
        bookings = bookings.filter(booking => booking.isApproved === true);
      } else if (query.data.status === "rejected") {
        bookings = bookings.filter(booking => booking.isApproved === false);
      }
    }

    // Format dates and times for display
    const formattedBookings = bookings.map(booking => {
      // Format date
      const [year, month, day] = booking.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const formattedDate = format(dateObj, 'MMMM d, yyyy');

      // Format start and end times to 12-hour format
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      };

      return {
        ...booking,
        date: formattedDate,
        startTime: formatTime(booking.startTime),
        endTime: formatTime(booking.endTime)
      };
    });

    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json({ message: `Error fetching bookings - ${errorMessage}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a temporary schema for the incoming data
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

    const { customerName, sport, date, startTime, endTime, duration, courtId, courtName, price, peopleCount } = validationResult.data;

    // Create booking using the InsertBooking schema
    const newBooking = await storage.createBooking({
      customer_name: customerName,
      sport,
      date,
      start_time: startTime,
      end_time: endTime,
      duration: Number(duration),
      court_id: Number(courtId),
      court_name: courtName,
      price: Number(price),
      people_count: Number(peopleCount)
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return NextResponse.json({ message: `Error creating booking - ${errorMessage}` }, { status: 500 });
  }
}