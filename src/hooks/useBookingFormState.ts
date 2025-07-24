'use client';

import { useState, useCallback, useEffect } from 'react';
import { BookingFormData, FormState } from '@/lib/booking-form-schema';

// Availability checking hook
export const useAvailabilityCheck = () => {
  const [availabilityStatus, setAvailabilityStatus] = useState<FormState['availabilityStatus']>('idle');
  const [availableCourts, setAvailableCourts] = useState<Array<{ id: number; name: string }>>([]);

  const checkAvailability = useCallback(async (
    date: Date | null,
    time: string,
    duration: number
  ) => {
    if (!date || !time || !duration) {
      setAvailabilityStatus('idle');
      return;
    }

    setAvailabilityStatus('checking');

    try {
      // Simulate API call - replace with actual availability check
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock availability logic - replace with real implementation
      const isAvailable = Math.random() > 0.3; // 70% chance of availability
      
      if (isAvailable) {
        setAvailableCourts([{ id: 1, name: 'Court A' }]);
        setAvailabilityStatus('available');
      } else {
        setAvailableCourts([]);
        setAvailabilityStatus('unavailable');
      }
    } catch (error) {
      console.error('Availability check failed:', error);
      setAvailabilityStatus('unavailable');
      setAvailableCourts([]);
    }
  }, []);

  return {
    availabilityStatus,
    availableCourts,
    checkAvailability,
  };
};

// Form persistence hook
export const useFormPersistence = (key: string = 'booking-form-data') => {
  const saveFormData = useCallback((data: Partial<BookingFormData>) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [key]);

  const loadFormData = useCallback((): Partial<BookingFormData> | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date string back to Date object if it exists
        if (parsed.date) {
          parsed.date = new Date(parsed.date);
        }
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
    return null;
  }, [key]);

  const clearFormData = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, [key]);

  return {
    saveFormData,
    loadFormData,
    clearFormData,
  };
};

// Form validation state hook
export const useFormValidation = () => {
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const enableValidation = useCallback(() => {
    setShowValidation(true);
  }, []);

  const disableValidation = useCallback(() => {
    setShowValidation(false);
    setValidationErrors({});
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    showValidation,
    validationErrors,
    enableValidation,
    disableValidation,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  };
};