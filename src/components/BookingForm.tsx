'use client';

import { useState, useEffect, useMemo } from "react";
import { format, addDays, parse } from "date-fns";
import { calculateBookingPrice } from "@/lib/timeUtils";
import { addToCartAction, type ActionResult } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarIcon, MinusIcon, PlusIcon, Clock, Phone, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookingFormValues {
  customerName: string;
  sport: string;
  peopleCount: number;
  date: Date | null;
  time: string;
  duration: number;
  courtId: number;
}

interface Court {
  id: number;
  name: string;
}

interface BookingFormProps {
  turfName: string;
  turfLocation: string;
}

interface BookingResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isApproved?: boolean;
}

export default function BookingForm({ turfName, turfLocation }: BookingFormProps) {
  const courtName = "Court A";
  const courtId = 1;
  const { toast } = useToast();

  const [availableCourts, setAvailableCourts] = useState<Court[]>([{ id: courtId, name: courtName }]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<{ date: string; startTime: string; endTime: string; }[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState<BookingFormValues>({
    customerName: "",
    sport: "cricket",
    peopleCount: 2,
    date: new Date(),
    time: "",
    duration: 0.5,
    courtId: courtId
  });

  // Debug: Log form values to console
  console.log('Current form values:', formValues);



  // Fetch bookings for availability checking
  const selectedDate = formValues.date;
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const prevDayDate = selectedDate ? format(addDays(selectedDate, -1), "yyyy-MM-dd") : null;
  const nextDayDate = selectedDate ? format(addDays(selectedDate, 1), "yyyy-MM-dd") : null;

  useEffect(() => {
    const fetchBookings = async () => {
      if (!formattedDate) return;

      try {
        const dates = [formattedDate];
        if (prevDayDate) dates.unshift(prevDayDate);
        if (nextDayDate) dates.push(nextDayDate);

        const response = await fetch(`/api/bookings?dates=${encodeURIComponent(JSON.stringify(dates))}`);
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, [formattedDate, prevDayDate, nextDayDate]);

  // Update bookedTimeSlots whenever bookings change
  useEffect(() => {
    const slots = bookings
      .filter((booking: any) => booking.isApproved !== false)
      .map((booking: any) => {
        const parsedDate = parse(booking.date, 'MMMM d, yyyy', new Date());
        const standardDate = format(parsedDate, 'yyyy-MM-dd');
        return {
          date: standardDate,
          startTime: booking.startTime,
          endTime: booking.endTime
        };
      });
    setBookedTimeSlots(slots);
  }, [bookings]);

  // Helper: convert "5:00 PM" to minutes since midnight
  const time12ToMinutes = (t: string) => {
    const [time, period] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  // Helper: check if a time slot is available for the selected date/duration
  const isTimeSlotAvailable = (date: Date | null, startTime: string, duration: number) => {
    if (!date || !startTime) return false;

    const [h, m] = startTime.split(":").map(Number);
    const slotStartMin = h * 60 + m;
    const durationMinutes = duration * 60;
    let slotEndMin = slotStartMin + durationMinutes;

    const prevDayStr = format(addDays(date, -1), "yyyy-MM-dd");
    const formattedDateStr = format(date, "yyyy-MM-dd");
    const nextDayStr = format(addDays(date, 1), "yyyy-MM-dd");

    const crossesMidnight = slotEndMin >= 24 * 60;
    if (crossesMidnight) {
      slotEndMin = slotEndMin % (24 * 60);
    }

    // Non-operating hours check (2 AM - 5:30 AM)
    const nonOperatingStartMin = 2 * 60;
    const nonOperatingEndMin = 5 * 60 + 30;

    if ((slotStartMin >= nonOperatingStartMin && slotStartMin < nonOperatingEndMin) ||
      (slotEndMin > nonOperatingStartMin && slotEndMin <= nonOperatingEndMin)) {
      return false;
    }

    // Check overlap with existing bookings
    for (const slot of bookedTimeSlots) {
      const bookingStartMin = time12ToMinutes(slot.startTime);
      let bookingEndMin = time12ToMinutes(slot.endTime);
      const bookingCrossesMidnight = bookingEndMin <= bookingStartMin;

      if (crossesMidnight) {
        if (slot.date === nextDayStr) {
          if (slotEndMin > bookingStartMin ||
            (bookingCrossesMidnight && bookingEndMin > slotEndMin)) {
            return false;
          }
        } else if (slot.date === formattedDateStr) {
          if (bookingCrossesMidnight) {
            bookingEndMin += 24 * 60;
          }
          if (slotStartMin < bookingEndMin) {
            return false;
          }
        }
      } else {
        if (slot.date === prevDayStr && bookingCrossesMidnight) {
          const adjustedEndMin = bookingEndMin % (24 * 60);
          if (slotStartMin < adjustedEndMin) {
            return false;
          }
        } else if (slot.date === formattedDateStr) {
          if (bookingCrossesMidnight) {
            bookingEndMin += 24 * 60;
          }
          if (slotStartMin < bookingEndMin && slotEndMin > bookingStartMin) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const getFieldValidationClass = (fieldName: string) => {
    if (!showValidation) return "";

    switch (fieldName) {
      case 'customerName':
        return !formValues.customerName?.trim() ? "border-red-500 ring-2 ring-red-500/20" : "";
      case 'sports':
        return !formValues.sport ? "border-red-500 ring-2 ring-red-500/20" : "";
      case 'date':
        return !formValues.date ? "border-red-500 ring-2 ring-red-500/20" : "";
      case 'startTime':
        return !formValues.time ? "border-red-500 ring-2 ring-red-500/20" : "";
      case 'peopleCount':
        return (!formValues.peopleCount || formValues.peopleCount < 2) ? "border-red-500 ring-2 ring-red-500/20" : "";
      case 'duration':
        return (!formValues.duration || formValues.duration < 0.5) ? "border-red-500 ring-2 ring-red-500/20" : "";
      default:
        return "";
    }
  };

  const checkMissingFields = (): string[] => {
    const missingFields: string[] = [];

    if (!formValues.customerName?.trim()) missingFields.push('customerName');
    if (!formValues.sport) missingFields.push('activity');
    if (!formValues.date) missingFields.push('date');
    if (!formValues.time) missingFields.push('startTime');
    if (!formValues.peopleCount || formValues.peopleCount < 2) missingFields.push('peopleCount');
    if (!formValues.duration || formValues.duration < 0.5) missingFields.push('duration');

    return missingFields;
  };

  const handleAddToCart = async () => {
    setShowValidation(true);
    const missingFields = checkMissingFields();

    if (missingFields.length > 0) {
      toast({
        title: "Please fill required fields",
        description: "Some required information is missing",
        variant: "destructive",
      });
      return;
    }

    if (availableCourts.length === 0) {
      toast({
        title: "Error",
        description: "No courts are available for this time slot",
        variant: "destructive",
      });
      return;
    }

    if (!formValues.date) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('customerName', formValues.customerName);
      formData.append('sport', formValues.sport);
      formData.append('peopleCount', formValues.peopleCount.toString());
      formData.append('date', format(formValues.date, 'yyyy-MM-dd'));
      formData.append('time', formValues.time);
      formData.append('duration', formValues.duration.toString());
      formData.append('courtId', formValues.courtId.toString());

      const result = await addToCartAction(formData);

      if (result.success) {
        // Calculate end time for localStorage
        const startTime = formValues.time;
        const [hours, minutes] = startTime.split(":").map(Number);
        const durationHours = Math.floor(formValues.duration);
        const durationMinutes = (formValues.duration % 1) * 60;
        let endHours = hours + durationHours;
        let endMinutes = minutes + durationMinutes;

        if (endMinutes >= 60) {
          endHours += 1;
          endMinutes -= 60;
        }

        endHours = endHours % 24;
        const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;

        const cartItem = {
          ...formValues,
          date: format(formValues.date, "yyyy-MM-dd"),
          startTime,
          endTime,
          courtName: availableCourts[0].name,
          price: calculateBookingPrice(format(formValues.date, "yyyy-MM-dd"), startTime, formValues.duration),
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
    } finally {
      setIsLoading(false);
    }
  };

  const incrementDuration = () => {
    console.log('Increment duration clicked');
    if (formValues.duration < 4) {
      setFormValues(prev => ({ ...prev, duration: prev.duration + 0.5 }));
    }
  };

  const decrementDuration = () => {
    console.log('Decrement duration clicked');
    if (formValues.duration > 0.5) {
      setFormValues(prev => ({ ...prev, duration: prev.duration - 0.5 }));
    }
  };

  const isFormValid = () => {
    return (
      formValues.customerName &&
      formValues.sport &&
      formValues.date &&
      formValues.time &&
      formValues.peopleCount >= 2 &&
      formValues.duration >= 0.5 &&
      availableCourts.length > 0
    );
  };

  const getPlayerLimits = (sport: string) => {
    switch (sport) {
      case 'volleyball':
        return { min: 2, max: 10 };
      case 'football':
        return { min: 2, max: 14 };
      default:
        return { min: 2, max: 16 };
    }
  };

  const isEvent = (selection: string) => {
    return ['business-meet', 'birthday', 'wedding', 'others-event'].includes(selection);
  };

  const selectedIsEvent = isEvent(formValues.sport);

  useEffect(() => {
    if (selectedIsEvent) {
      localStorage.setItem("hideCart", "true");
    } else {
      localStorage.removeItem("hideCart");
    }
    window.dispatchEvent(new Event("cart-visibility-changed"));
  }, [selectedIsEvent]);



  return (
    <Card className="bg-white rounded-2xl shadow-lg border border-neutral-200/80">
      <CardContent className="p-6 lg:p-8">
        {/* Turf Information */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary tracking-tight">{turfName}</h1>
          <p className="text-neutral-500 text-base md:text-lg mt-1">{turfLocation}</p>
        </div>

        {/* Booking Form */}
        <form
          className="space-y-6 w-full"
          aria-label="Turf Booking Form"
          onSubmit={e => {
            e.preventDefault();
            handleAddToCart();
          }}
        >
          {/* Customer Name */}
          <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.05s', animationFillMode: 'backwards' }}>
            <Label htmlFor="customerName" className="font-medium text-base">Your Name<span className="text-red-500">*</span></Label>
            <input
              id="customerName"
              aria-label="Your Name"
              aria-required="true"
              required
              value={formValues.customerName}
              onChange={(e) => setFormValues(prev => ({ ...prev, customerName: e.target.value }))}
              className={cn(
                "flex h-14 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all",
                getFieldValidationClass("customerName")
              )}
              placeholder="Enter your name"
              autoComplete="name"
            />
          </div>

          {/* Sports Selection */}
          <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            <Label htmlFor="sports" className="font-medium text-base">Activity<span className="text-red-500">*</span></Label>
            <Select
              value={formValues.sport}
              onValueChange={(value) => {
                console.log('Sport selected:', value);
                setFormValues(prev => ({ ...prev, sport: value, peopleCount: 2 }));
              }}
            >
              <SelectTrigger
                id="sports"
                aria-label="Sport"
                aria-required="true"
                className={cn(
                  "h-14 rounded-xl text-base border border-input bg-background focus:ring-2 focus:ring-primary",
                  getFieldValidationClass("sports")
                )}
              >
                <SelectValue placeholder="Select Activity" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[240px] pr-3">
                  <div className="font-semibold text-primary px-2 py-1.5 text-sm">Sports</div>
                  <SelectItem value="football">⚽ Football</SelectItem>
                  <SelectItem value="cricket">🏏 Cricket</SelectItem>
                  <SelectItem value="volleyball">🏐 Volleyball</SelectItem>
                  <SelectItem value="others-sport">🎯 Other Sports</SelectItem>

                  <SelectSeparator className="my-2" />

                  <div className="font-semibold text-primary px-2 py-1.5 text-sm">Events</div>
                  <SelectItem value="business-meet">💼 Business Meeting</SelectItem>
                  <SelectItem value="birthday">🎂 Birthday Celebration</SelectItem>
                  <SelectItem value="wedding">💒 Wedding Reception</SelectItem>
                  <SelectItem value="others-event">🎉 Other Events</SelectItem>
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* Event Booking Available Message */}
          {selectedIsEvent && (
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Event Booking Available</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Our venue is perfect for your special occasions. Contact us to customize the space for your event.
                </p>

                <div className="bg-white rounded-lg p-4 border border-green-200 space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Contact Owner</h4>
                  </div>

                  <a
                    href={`tel:+91${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
                    className="group flex items-center justify-between p-3 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200"
                  >
                    <span className="font-semibold text-green-700">+91 {process.env.NEXT_PUBLIC_PHONE_NUMBER}</span>
                    <ArrowRight className="h-5 w-5 text-green-600 transform group-hover:translate-x-1 transition-transform" />
                  </a>

                  <ul className="text-sm text-green-700 space-y-2 mt-3">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">•</span> Custom venue setup
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">•</span> Flexible timing options
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">•</span> Event planning assistance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Number of People */}
          {formValues.sport && !selectedIsEvent && (
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
              <Label htmlFor="peopleCount" className="font-medium text-base">Number of People<span className="text-red-500">*</span></Label>
              <Select
                value={formValues.peopleCount?.toString()}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, peopleCount: parseInt(value) }))}
              >
                <SelectTrigger
                  id="peopleCount"
                  aria-label="Number of People"
                  aria-required="true"
                  className={cn(
                    "h-14 rounded-xl text-base border border-input bg-background focus:ring-2 focus:ring-primary",
                    getFieldValidationClass("peopleCount")
                  )}
                >
                  <SelectValue placeholder="Select number of people" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from(
                    { length: getPlayerLimits(formValues.sport).max - 1 },
                    (_, i) => i + 2
                  ).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Picker */}
          {!selectedIsEvent && (
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <Label htmlFor="date" className="font-medium text-base">Date<span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    aria-label="Date"
                    aria-required="true"
                    variant="outline"
                    className={cn(
                      "w-full h-14 rounded-xl justify-start text-left font-normal text-base border border-input bg-background hover:bg-accent/40 transition-all",
                      getFieldValidationClass("date")
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                    {formValues.date ? (
                      format(formValues.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formValues.date || undefined}
                    onSelect={(date) => date && setFormValues(prev => ({ ...prev, date }))}
                    defaultMonth={formValues.date || undefined}
                    initialFocus
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const compareDate = new Date(date);
                      compareDate.setHours(0, 0, 0, 0);
                      return compareDate < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Start Time */}
          {!selectedIsEvent && (
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}>
              <Label htmlFor="startTime" className="font-medium text-base">Start Time*</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startTime"
                    variant="outline"
                    className={cn(
                      "w-full h-12 rounded-lg justify-start text-left font-normal text-base border border-input bg-background hover:bg-accent/40 transition-all",
                      getFieldValidationClass("startTime")
                    )}
                  >
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    {formValues.time && formValues.time !== "" ? (
                      <span>{formValues.time.replace(/(\d+):(\d+)/, (_, h, m) =>
                        `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
                      )}</span>
                    ) : (
                      <span>Select time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = i % 2 === 0 ? "00" : "30";
                      const timeValue = `${hour}:${minute}`;
                      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                      const amPm = hour >= 12 ? "PM" : "AM";

                      const isNonOperatingHour = hour >= 2 && hour < 6;
                      const disabled = isNonOperatingHour || !isTimeSlotAvailable(formValues.date, timeValue, 0.5);

                      const currentTime = formValues.time;
                      const isSelected = currentTime !== "" && currentTime === timeValue;

                      return (
                        <Button
                          key={timeValue}
                          type="button"
                          variant="outline"
                          tabIndex={-1}
                          className={cn(
                            "text-center rounded-lg border border-input transition-all font-medium text-base focus:outline-none",
                            isSelected && "bg-primary text-white hover:bg-primary",
                            !disabled && !isSelected && "hover:bg-primary/10 hover:text-primary",
                            disabled && "opacity-50 cursor-not-allowed bg-gray-200 text-gray-400 hover:bg-gray-200 hover:text-gray-400",
                            isNonOperatingHour && "bg-red-50 hover:bg-red-50 hover:text-gray-400"
                          )}
                          onClick={() => {
                            if (!disabled) setFormValues(prev => ({ ...prev, time: timeValue }));
                          }}
                          disabled={disabled}
                        >
                          {displayHour}:{minute} {amPm}
                          {isNonOperatingHour && <span className="ml-1 text-red-500">✕</span>}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Duration */}
          {!selectedIsEvent && (
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
              <Label htmlFor="duration" className="font-medium text-base">Duration (hours)*</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={decrementDuration}
                  className="h-12 w-12 rounded-l-lg p-0 flex items-center justify-center bg-neutral-200 text-neutral-700 hover:bg-neutral-300 text-lg"
                  disabled={formValues.duration <= 0.5}
                >
                  <MinusIcon className="w-6 h-6" />
                </Button>
                <div className={cn(
                  "flex-1 h-12 rounded-none border-y border-input bg-background px-4 py-2 text-base text-center flex items-center justify-center font-medium",
                  getFieldValidationClass("duration")
                )}>
                  {formValues.duration} {formValues.duration === 1 ? 'hour' : 'hours'}
                </div>
                <Button
                  type="button"
                  onClick={incrementDuration}
                  className="h-12 w-12 rounded-r-lg p-0 flex items-center justify-center bg-primary text-white hover:bg-primary/90 text-lg"
                  disabled={formValues.duration >= 4}
                >
                  <PlusIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>
          )}

          {/* Turf Availability Message */}
          {!selectedIsEvent && (
            <div className="space-y-1 animate-fade-in" style={{ animationDelay: '0.35s', animationFillMode: 'backwards' }}>
              <div className="flex items-center justify-between">
                <Label className="font-medium text-base">Turf Availability</Label>
                {isTimeSlotAvailable(formValues.date, formValues.time, formValues.duration) && availableCourts.length > 0 ? (
                  <span className="text-sm text-green-600 font-semibold flex items-center animate-pulse">
                    ✓ Turf Available
                  </span>
                ) : (
                  <span className="text-sm text-red-500 font-semibold flex items-center animate-pulse">
                    ✗ Turf Not Available
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {!selectedIsEvent && (
            <div className="sticky bottom-0 z-10 bg-white/80 pt-2 pb-1 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <Button
                type="submit"
                aria-label="Add to Cart"
                className="w-full h-16 text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-xl hover:from-primary/90 hover:to-primary/70 transition-all mt-2 focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
                disabled={!isTimeSlotAvailable(formValues.date, formValues.time, formValues.duration) || availableCourts.length === 0 || isLoading}
                variant={isTimeSlotAvailable(formValues.date, formValues.time, formValues.duration) && availableCourts.length > 0 ? "default" : "secondary"}
              >
                {isLoading ? "Adding..." : "Add To Cart"}
              </Button>
            </div>
          )}

        </form>
      </CardContent>
    </Card>
  );
}