'use client';

import React from 'react';
import { BookingFormProvider, useBookingForm } from './BookingFormProvider';
import { BookingFormData } from '@/lib/booking-form-schema';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { calculateBookingPrice } from '@/lib/timeUtils';
import { addToCartAction } from '@/lib/actions';
import { format } from 'date-fns';

// Props interface for the enhanced booking form
interface EnhancedBookingFormProps {
  turfName: string;
  turfLocation: string;
  onSubmit?: (data: BookingFormData) => Promise<void>;
  className?: string;
}

// Form content component (wrapped by provider)
const BookingFormContent: React.FC = () => {
  const { form, formState, currentStep, totalSteps } = useBookingForm();
  const { toast } = useToast();

  // Watch form values for real-time updates
  const formValues = form.watch();

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="card-enterprise overflow-hidden animate-scale-in">
        <CardContent className="p-0">
          {/* Professional Header Section */}
          <div className="card-section bg-gradient-card">
            <div className="text-center">
              <h2 className="heading-primary">
                Enhanced Booking Form
              </h2>
              <p className="text-muted mb-6">
                Step {currentStep + 1} of {totalSteps}
              </p>
              
              {/* Professional Progress Indicator */}
              <div className="flex justify-center items-center gap-2 mb-6">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i <= currentStep 
                        ? 'bg-primary shadow-sm' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              {/* Enhanced Debug Info with Professional Styling */}
              <div className="text-sm bg-background-subtle border border-border-subtle rounded-lg p-4 shadow-xs">
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="font-medium">Form Foundation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="font-medium">React Hook Form</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="font-medium">Zod Validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="font-medium">Form Provider</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="font-medium text-foreground/80 mb-2">Current Values:</p>
                  <div className="bg-background rounded-md p-3 border border-border-subtle">
                    <pre className="text-xs text-foreground-muted overflow-x-auto">
                      {JSON.stringify(formValues, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main enhanced booking form component
export const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({
  turfName,
  turfLocation,
  onSubmit,
  className,
}) => {
  const { toast } = useToast();

  // Default submit handler
  const handleSubmit = async (data: BookingFormData) => {
    if (onSubmit) {
      await onSubmit(data);
      return;
    }

    // Default submission logic (similar to original form)
    try {
      const formData = new FormData();
      formData.append('customerName', data.customerName);
      formData.append('sport', data.sport);
      formData.append('peopleCount', data.peopleCount.toString());
      formData.append('date', format(data.date, 'yyyy-MM-dd'));
      formData.append('time', data.time);
      formData.append('duration', data.duration.toString());
      formData.append('courtId', data.courtId.toString());

      const result = await addToCartAction(formData);

      if (result.success) {
        // Calculate end time for localStorage
        const startTime = data.time;
        const [hours, minutes] = startTime.split(":").map(Number);
        const durationHours = Math.floor(data.duration);
        const durationMinutes = (data.duration % 1) * 60;
        let endHours = hours + durationHours;
        let endMinutes = minutes + durationMinutes;

        if (endMinutes >= 60) {
          endHours += 1;
          endMinutes -= 60;
        }

        endHours = endHours % 24;
        const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;

        const cartItem = {
          ...data,
          date: format(data.date, "yyyy-MM-dd"),
          startTime,
          endTime,
          courtName: "Court A", // This should come from available courts
          price: calculateBookingPrice(format(data.date, "yyyy-MM-dd"), startTime, data.duration),
        };

        localStorage.setItem("cartItems", JSON.stringify([cartItem]));
        window.dispatchEvent(new Event("cart-updated"));

        toast({
          title: "Success!",
          description: "Booking added to cart",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add booking to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={className}>
      <BookingFormProvider onSubmit={handleSubmit}>
        <BookingFormContent />
      </BookingFormProvider>
    </div>
  );
};