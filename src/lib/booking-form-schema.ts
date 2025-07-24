import { z } from "zod";

// Form validation schema using Zod
export const bookingFormSchema = z.object({
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  
  sport: z
    .string()
    .min(1, "Please select an activity"),
  
  peopleCount: z
    .number()
    .min(2, "Minimum 2 people required")
    .max(16, "Maximum 16 people allowed"),
  
  date: z
    .date({
      required_error: "Please select a date",
      invalid_type_error: "Please select a valid date",
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Date cannot be in the past"),
  
  time: z
    .string()
    .min(1, "Please select a time")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please select a valid time"),
  
  duration: z
    .number()
    .min(0.5, "Minimum duration is 30 minutes")
    .max(4, "Maximum duration is 4 hours")
    .refine((val) => val % 0.5 === 0, "Duration must be in 30-minute increments"),
  
  courtId: z
    .number()
    .min(1, "Please select a court"),
});

// Infer TypeScript types from schema
export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Form step configuration
export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: (keyof BookingFormData)[];
}

export const formSteps: FormStep[] = [
  {
    id: "personal-info",
    title: "Personal Information",
    description: "Tell us who you are",
    fields: ["customerName"],
  },
  {
    id: "activity-selection",
    title: "Choose Activity",
    description: "Select your sport or event",
    fields: ["sport", "peopleCount"],
  },
  {
    id: "date-time",
    title: "Date & Time",
    description: "When would you like to play?",
    fields: ["date", "time", "duration"],
  },
  {
    id: "review",
    title: "Review & Book",
    description: "Confirm your booking details",
    fields: ["courtId"],
  },
];

// Form state interface
export interface FormState {
  currentStep: number;
  isSubmitting: boolean;
  availabilityStatus: 'idle' | 'checking' | 'available' | 'unavailable';
  errors: Record<string, string>;
}

// Default form values
export const defaultFormValues: BookingFormData = {
  customerName: "",
  sport: "cricket",
  peopleCount: 2,
  date: new Date(),
  time: "",
  duration: 0.5,
  courtId: 1,
};