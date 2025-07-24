'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from './db';
import { bookings, signinSchema, signupSchema } from './schema';
import { storage } from './storage';
import { comparePasswords, generateToken, hashPassword, setAuthCookie, clearAuthCookie } from './auth';

const BookingFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  sport: z.string().min(1, 'Sport is required'),
  peopleCount: z.coerce.number().min(2, 'At least 2 people required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, 'Invalid time format'),
  duration: z.coerce.number().min(0.5, 'Minimum duration is 0.5 hours').max(4, 'Maximum duration is 4 hours'),
  courtId: z.coerce.number().int().positive(),
});

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function addToCartAction(formData: FormData): Promise<ActionResult> {
  try {
    const validatedFields = BookingFormSchema.safeParse({
      customerName: formData.get('customerName'),
      sport: formData.get('sport'),
      peopleCount: formData.get('peopleCount'),
      date: formData.get('date'),
      time: formData.get('time'),
      duration: formData.get('duration'),
      courtId: formData.get('courtId') || '1',
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Invalid form data',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { customerName, sport, peopleCount, date, time, duration, courtId } = validatedFields.data;

    // Calculate end time
    const [hours, minutes] = time.split(':').map(Number);
    const durationHours = Math.floor(duration);
    const durationMinutes = (duration % 1) * 60;
    let endHours = hours + durationHours;
    let endMinutes = minutes + durationMinutes;
    
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    
    // Handle hours crossing midnight
    endHours = endHours % 24;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Calculate price (simplified for now)
    const price = Math.round(duration * 600); // Base rate of 600 per hour

    const cartItem = {
      customerName,
      sport,
      peopleCount,
      date,
      startTime: time,
      endTime,
      duration,
      courtId,
      courtName: 'Court A',
      price,
    };

    // In a real app, you might store this in a database or session
    // For now, we'll return success and let the client handle localStorage
    return {
      success: true,
      message: 'Booking added to cart successfully',
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return {
      success: false,
      message: 'Failed to add booking to cart',
    };
  }
}

const CartItemSchema = z.object({
  customerName: z.string().min(1),
  sport: z.string().min(1),
  peopleCount: z.number().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  duration: z.number().min(0.5).max(4),
  courtId: z.number().int().positive(),
  courtName: z.string(),
  price: z.number().positive(),
});

// Helper function to check for booking conflicts
async function checkBookingConflicts(cartItems: any[]): Promise<boolean> {
  try {
    // For mock database, always return false (no conflicts)
    if (!process.env.DATABASE_URL) {
      return false;
    }

    for (const item of cartItems) {
      // Convert time to minutes for easier comparison
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const itemStartMin = timeToMinutes(item.startTime);
      let itemEndMin = timeToMinutes(item.endTime);
      
      // Handle midnight crossing
      if (itemEndMin <= itemStartMin) {
        itemEndMin += 24 * 60;
      }

      try {
        // Query existing bookings for the same date and court
        const existingBookings = await db
          .select()
          .from(bookings);

        // Filter bookings for the same date and court
        const relevantBookings = existingBookings.filter((booking: any) => 
          booking.date === item.date && 
          booking.courtId === item.courtId &&
          booking.isApproved !== false // Include pending and approved bookings
        );

        // Check for conflicts with existing bookings
        for (const booking of relevantBookings) {
          const bookingStartMin = timeToMinutes(booking.startTime);
          let bookingEndMin = timeToMinutes(booking.endTime);
          
          if (bookingEndMin <= bookingStartMin) {
            bookingEndMin += 24 * 60;
          }

          // Check for overlap
          if (itemStartMin < bookingEndMin && itemEndMin > bookingStartMin) {
            return true; // Conflict found
          }
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // For mock database or query errors, assume no conflicts
        continue;
      }
    }
    return false; // No conflicts
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return false; // Don't block booking on error
  }
}

// Helper function to send Telegram notification
async function sendTelegramNotification(booking: any): Promise<void> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('Telegram credentials not configured');
      return;
    }

    // Format booking time display
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toUpperCase();
    };

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };

    const timeDisplay = `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)} (${formatDate(booking.date)})`;
    const timestamp = Date.now();
    
    const message = `📢 New Booking ${timestamp}!\n\n👤 Name: ${booking.customerName}\n📍 Sport: ${booking.sport}\n⏰ Time: ${timeDisplay}\n👥 People: ${booking.peopleCount}\n💰 Price: ₹${booking.price}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    // Don't throw error - notification failure shouldn't break booking
  }
}

export async function processCartAction(formData: FormData): Promise<ActionResult> {
  try {
    const action = formData.get('action') as string;
    const cartItemsJson = formData.get('cartItems') as string;
    
    if (!cartItemsJson) {
      return {
        success: false,
        message: 'No cart items provided',
      };
    }

    const cartItems = JSON.parse(cartItemsJson);
    
    // Validate cart items
    const validatedItems = cartItems.map((item: any) => {
      const result = CartItemSchema.safeParse(item);
      if (!result.success) {
        throw new Error(`Invalid cart item: ${result.error.message}`);
      }
      return result.data;
    });

    if (action === 'check-conflicts') {
      // Check for booking conflicts
      const hasConflicts = await checkBookingConflicts(validatedItems);
      
      if (hasConflicts) {
        return {
          success: false,
          message: 'Booking conflicts detected',
        };
      }
      
      return {
        success: true,
        message: 'No conflicts found',
      };
    }

    if (action === 'reserve') {
      // Check for conflicts first
      const hasConflicts = await checkBookingConflicts(validatedItems);
      
      if (hasConflicts) {
        return {
          success: false,
          message: 'Someone else booked a conflicting slot recently. Please select a different time.',
        };
      }

      // Create bookings in database
      for (const item of validatedItems) {
        const bookingData = {
          customerName: item.customerName,
          sport: item.sport,
          peopleCount: item.peopleCount,
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          duration: Math.round(item.duration * 60), // Convert to minutes for database
          courtId: item.courtId,
          price: item.price,
          isApproved: null, // Pending approval
        };

        await db.insert(bookings).values(bookingData);
        
        // Send Telegram notification
        await sendTelegramNotification(item);
      }

      // Revalidate relevant pages
      revalidatePath('/');
      revalidatePath('/admin');

      return {
        success: true,
        message: 'Bookings reserved successfully',
      };
    }

    return {
      success: false,
      message: 'Invalid action',
    };
  } catch (error) {
    console.error('Error processing cart:', error);
    return {
      success: false,
      message: 'Failed to process cart',
    };
  }
}

export async function removeFromCartAction(formData: FormData): Promise<ActionResult> {
  try {
    // This is handled client-side with localStorage
    // This action is here for consistency but doesn't need server logic
    return {
      success: true,
      message: 'Item removed from cart',
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return {
      success: false,
      message: 'Failed to remove item from cart',
    };
  }
}

// Authentication Server Actions
export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const validatedFields = signinSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Invalid form data',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { username, password } = validatedFields.data;

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Generate JWT token and set cookie
    const token = await generateToken(user);
    await setAuthCookie(token);

    // Revalidate pages that depend on auth state
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      message: `Welcome back, ${user.username}!`,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      message: 'Failed to log in',
    };
  }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  try {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    // Check password confirmation
    if (password !== confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
        errors: {
          confirmPassword: ['Passwords do not match'],
        },
      };
    }

    const validatedFields = signupSchema.safeParse({
      username: formData.get('username'),
      password: password,
      fullName: formData.get('fullName'),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: 'Invalid form data',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { username, fullName } = validatedFields.data;

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return {
        success: false,
        message: 'Username already exists',
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      fullName,
      role: 'user', // Default role for new registrations
    });

    // Generate JWT token and set cookie
    const token = await generateToken(newUser);
    await setAuthCookie(token);

    // Revalidate pages that depend on auth state
    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      message: `Welcome, ${newUser.username}!`,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      message: 'Failed to register user',
    };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    await clearAuthCookie();
    
    // Revalidate pages that depend on auth state
    revalidatePath('/');
    revalidatePath('/admin');
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Error logging out:', error);
    return {
      success: false,
      message: 'Failed to log out',
    };
  }
}