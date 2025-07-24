'use client';

import React, { createContext, useContext, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { 
  BookingFormData, 
  bookingFormSchema, 
  defaultFormValues,
  FormState,
  formSteps 
} from '@/lib/booking-form-schema';

// Form context interface
interface BookingFormContextType {
  form: UseFormReturn<BookingFormData>;
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  isStepValid: (stepIndex: number) => boolean;
  isFormComplete: () => boolean;
}

// Create form context
const BookingFormContext = createContext<BookingFormContextType | undefined>(undefined);

// Custom hook to use form context
export const useBookingForm = () => {
  const context = useContext(BookingFormContext);
  if (!context) {
    throw new Error('useBookingForm must be used within BookingFormProvider');
  }
  return context;
};

// Form provider props
interface BookingFormProviderProps {
  children: React.ReactNode;
  onSubmit: (data: BookingFormData) => Promise<void>;
  initialValues?: Partial<BookingFormData>;
}

// Form provider component
export const BookingFormProvider: React.FC<BookingFormProviderProps> = ({
  children,
  onSubmit,
  initialValues = {},
}) => {
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      ...defaultFormValues,
      ...initialValues,
    },
    mode: 'onChange', // Validate on change for better UX
  });

  // Form state management
  const [formState, setFormState] = useState<FormState>({
    currentStep: 0,
    isSubmitting: false,
    availabilityStatus: 'idle',
    errors: {},
  });

  // Step navigation functions
  const nextStep = () => {
    if (formState.currentStep < formSteps.length - 1) {
      setFormState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const prevStep = () => {
    if (formState.currentStep > 0) {
      setFormState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < formSteps.length) {
      setFormState(prev => ({ ...prev, currentStep: step }));
    }
  };

  // Validation helpers
  const isStepValid = (stepIndex: number): boolean => {
    const step = formSteps[stepIndex];
    if (!step) return false;

    const formValues = form.getValues();
    const formErrors = form.formState.errors;

    // Check if all required fields for this step are valid
    return step.fields.every(field => {
      const value = formValues[field];
      const hasError = formErrors[field];
      
      // Basic validation - field has value and no errors
      if (hasError) return false;
      
      switch (field) {
        case 'customerName':
          return typeof value === 'string' && value.trim().length >= 2;
        case 'sport':
          return typeof value === 'string' && value.length > 0;
        case 'peopleCount':
          return typeof value === 'number' && value >= 2;
        case 'date':
          return value instanceof Date && !isNaN(value.getTime());
        case 'time':
          return typeof value === 'string' && value.length > 0;
        case 'duration':
          return typeof value === 'number' && value >= 0.5;
        case 'courtId':
          return typeof value === 'number' && value > 0;
        default:
          return true;
      }
    });
  };

  const isFormComplete = (): boolean => {
    return formSteps.every((_, index) => isStepValid(index));
  };

  // Handle form submission
  const handleSubmit = async (data: BookingFormData) => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error state if needed
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Context value
  const contextValue: BookingFormContextType = {
    form,
    formState,
    setFormState,
    currentStep: formState.currentStep,
    totalSteps: formSteps.length,
    nextStep,
    prevStep,
    goToStep,
    isStepValid,
    isFormComplete,
  };

  return (
    <BookingFormContext.Provider value={contextValue}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
          {children}
        </form>
      </Form>
    </BookingFormContext.Provider>
  );
};