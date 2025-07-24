'use client';

import React from 'react';
import { BookingFormProvider, useBookingForm } from './BookingFormProvider';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingFormData } from '@/lib/booking-form-schema';

// Test form content component
const TestFormContent: React.FC = () => {
  const { form, formState, currentStep, totalSteps, nextStep, prevStep, isStepValid } = useBookingForm();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Enhanced Form Foundation Test
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Customer Name Field */}
        <FormField
          control={form.control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your name" 
                  {...field} 
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Test Sport Field */}
        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter sport" 
                  {...field} 
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={currentStep === totalSteps - 1}
          >
            Next
          </Button>
        </div>

        {/* Status Display */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Form Valid:</span>
              <span className={form.formState.isValid ? 'text-green-600' : 'text-red-600'}>
                {form.formState.isValid ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current Step Valid:</span>
              <span className={isStepValid(currentStep) ? 'text-green-600' : 'text-red-600'}>
                {isStepValid(currentStep) ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Submitting:</span>
              <span>{formState.isSubmitting ? '⏳' : '✅'}</span>
            </div>
          </div>
        </div>

        {/* Form Values Display */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium">
            View Form Values
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

// Main test component
export const FormFoundationTest: React.FC = () => {
  const handleSubmit = async (data: BookingFormData) => {
    console.log('Form submitted with data:', data);
    alert('Form submitted successfully! Check console for data.');
  };

  return (
    <div className="p-8">
      <BookingFormProvider onSubmit={handleSubmit}>
        <TestFormContent />
      </BookingFormProvider>
    </div>
  );
};