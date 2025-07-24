import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Court model
export const courts = pgTable("courts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Booking model
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  sport: text("sport").notNull(),
  peopleCount: integer("people_count").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  startTime: text("start_time").notNull(), // Format: HH:MM
  endTime: text("end_time").notNull(), // Format: HH:MM
  duration: integer("duration").notNull(),
  courtId: integer("court_id").notNull(),
  price: integer("price").notNull(),
  isApproved: boolean("is_approved"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User model with role for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // "user" or "admin"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations after all tables are defined
export const courtsRelations = relations(courts, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  court: one(courts, {
    fields: [bookings.courtId],
    references: [courts.id],
  }),
}));

export const insertCourtSchema = createInsertSchema(courts).omit({
  id: true,
});

export const insertBookingSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  sport: z.string().min(1),
  people_count: z.number().int().min(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  start_time: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid start time format (HH:MM)"),
  end_time: z.string().regex(/^\d{1,2}:\d{2}$/, "Invalid end time format (HH:MM)"),
  duration: z.number().min(0.5).max(2), // Adjust range based on allowed values
  court_id: z.number().int().positive(),
  court_name: z.string(),
  price: z.number().int().positive(),
  is_approved: z.boolean().optional()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// Authentication schemas
export const signupSchema = insertUserSchema.omit({ role: true });
export const signinSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

export type Court = typeof courts.$inferSelect;
export type InsertCourt = z.infer<typeof insertCourtSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;