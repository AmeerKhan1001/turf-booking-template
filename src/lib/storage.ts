import { db } from './db';
import { courts, bookings, users } from './schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { Court, Booking, User, InsertUser, InsertCourt, InsertBooking } from './schema';

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Court operations
  getCourts(): Promise<Court[]>;
  getCourtById(id: number): Promise<Court | undefined>;
  createCourt(court: InsertCourt): Promise<Court>;
  getAvailableCourts(date: string, startTime: string, duration: number): Promise<Court[]>;
  
  // Booking operations
  getAllBookings(): Promise<(Booking & { courtName: string })[]>;
  getBookingsByCourtAndDates(courtId: number, dates: string[]): Promise<(Booking & { courtName: string })[]>;
  getBookingById(id: number): Promise<(Booking & { courtName: string }) | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  deleteBooking(id: number): Promise<boolean>;
  approveBooking(id: number): Promise<boolean>;
  rejectBooking(id: number): Promise<boolean>;
}

// Mock storage implementation for development
export class DrizzleStorage implements IStorage {
  private mockBookings: (Booking & { courtName: string })[] = [];
  private mockUsers: User[] = [
    { id: 1, username: 'admin', password: 'admin123', fullName: 'Administrator', role: 'admin', createdAt: new Date() }
  ];
  private mockCourts: Court[] = [
    { id: 1, name: 'Court A', isActive: true }
  ];

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.mockUsers.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.mockUsers.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.mockUsers.length + 1,
      ...user,
      role: user.role || 'user',
      createdAt: new Date()
    };
    this.mockUsers.push(newUser);
    return newUser;
  }

  // Court operations
  async getCourts(): Promise<Court[]> {
    return this.mockCourts.filter(court => court.isActive);
  }

  async getCourtById(id: number): Promise<Court | undefined> {
    return this.mockCourts.find(court => court.id === id);
  }

  async createCourt(court: InsertCourt): Promise<Court> {
    const newCourt: Court = {
      id: this.mockCourts.length + 1,
      ...court,
      isActive: court.isActive ?? true
    };
    this.mockCourts.push(newCourt);
    return newCourt;
  }

  async getAvailableCourts(date: string, startTime: string, duration: number): Promise<Court[]> {
    return this.mockCourts.filter(court => court.isActive);
  }

  // Booking operations
  async getAllBookings(): Promise<(Booking & { courtName: string })[]> {
    return this.mockBookings;
  }

  async getBookingsByCourtAndDates(courtId: number, dates: string[]): Promise<(Booking & { courtName: string })[]> {
    return this.mockBookings.filter(booking => 
      booking.courtId === courtId && dates.includes(booking.date)
    );
  }

  async getBookingById(id: number): Promise<(Booking & { courtName: string }) | undefined> {
    return this.mockBookings.find(booking => booking.id === id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const court = this.mockCourts.find(c => c.id === booking.court_id);
    const newBooking: Booking & { courtName: string } = {
      id: this.mockBookings.length + 1,
      customerName: booking.customer_name,
      sport: booking.sport,
      peopleCount: booking.people_count,
      date: booking.date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      duration: booking.duration,
      courtId: booking.court_id,
      price: booking.price,
      isApproved: null,
      createdAt: new Date(),
      courtName: court?.name || 'Unknown Court'
    };
    
    this.mockBookings.push(newBooking);
    
    // Return the booking without courtName for the API response
    const { courtName, ...bookingWithoutCourtName } = newBooking;
    return bookingWithoutCourtName;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const index = this.mockBookings.findIndex(booking => booking.id === id);
    if (index !== -1) {
      this.mockBookings.splice(index, 1);
      return true;
    }
    return false;
  }

  async approveBooking(id: number): Promise<boolean> {
    const booking = this.mockBookings.find(booking => booking.id === id);
    if (booking) {
      booking.isApproved = true;
      return true;
    }
    return false;
  }

  async rejectBooking(id: number): Promise<boolean> {
    const booking = this.mockBookings.find(booking => booking.id === id);
    if (booking) {
      booking.isApproved = false;
      return true;
    }
    return false;
  }
}

// Export storage instance
export const storage = new DrizzleStorage();