'use client';

import { useState, useEffect } from "react";
import { format, addDays, parse } from "date-fns";
import { calculateBookingPrice } from "@/lib/timeUtils";
import { addToCartAction } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MinusIcon,
  PlusIcon,
  Clock,
  Phone,
  ArrowRight,
  Users,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Timer,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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



  // Calculate estimated price for display
  const estimatedPrice = formValues.date && formValues.time && formValues.duration
    ? calculateBookingPrice(format(formValues.date, "yyyy-MM-dd"), formValues.time, formValues.duration)
    : 0;

  // Get sport emoji and details
  const getSportDetails = (sport: string) => {
    const sportMap: Record<string, { emoji: string; name: string; description: string }> = {
      'football': { emoji: '⚽', name: 'Football', description: 'Perfect for team matches' },
      'cricket': { emoji: '🏏', name: 'Cricket', description: 'Great for batting practice' },
      'volleyball': { emoji: '🏐', name: 'Volleyball', description: 'Ideal for tournaments' },
      'others-sport': { emoji: '🎯', name: 'Other Sports', description: 'Flexible space for any sport' },
      'business-meet': { emoji: '💼', name: 'Business Meeting', description: 'Professional venue' },
      'birthday': { emoji: '🎂', name: 'Birthday Party', description: 'Celebrate in style' },
      'wedding': { emoji: '💒', name: 'Wedding Reception', description: 'Memorable celebrations' },
      'others-event': { emoji: '🎉', name: 'Other Events', description: 'Custom event space' }
    };
    return sportMap[sport] || { emoji: '🎯', name: 'Activity', description: 'Select your activity' };
  };

  const sportDetails = getSportDetails(formValues.sport);
  const isAvailable = isTimeSlotAvailable(formValues.date, formValues.time, formValues.duration) && availableCourts.length > 0;

  return (
    <div className="max-w-2xl mx-auto">

      {/* Main Booking Form */}
      <Card className="overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-sport">
        <CardContent className="p-0">
          <form
            className="space-y-0"
            aria-label="Turf Booking Form"
            onSubmit={e => {
              e.preventDefault();
              handleAddToCart();
            }}
          >
            {/* Step 1: Personal Info */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="space-y-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="customerName" className="text-sm font-medium text-foreground/80 mb-2 block">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      id="customerName"
                      aria-label="Your Name"
                      aria-required="true"
                      required
                      value={formValues.customerName}
                      onChange={(e) => setFormValues(prev => ({ ...prev, customerName: e.target.value }))}
                      className={cn(
                        "w-full h-12 pl-4 pr-4 rounded-lg border border-border bg-background/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                        getFieldValidationClass("customerName")
                      )}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Activity Selection */}
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold">Choose Activity</h3>
              </div>

              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                <Label htmlFor="sports" className="text-sm font-medium text-foreground/80 mb-2 block">
                  Activity Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formValues.sport}
                  onValueChange={(value) => {
                    setFormValues(prev => ({ ...prev, sport: value, peopleCount: 2 }));
                  }}
                >
                  <SelectTrigger
                    id="sports"
                    aria-label="Sport"
                    aria-required="true"
                    className={cn(
                      "h-12 rounded-lg text-sm border border-border bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                      getFieldValidationClass("sports")
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sportDetails.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium">{sportDetails.name}</div>
                        <div className="text-xs text-muted-foreground">{sportDetails.description}</div>
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <ScrollArea className="h-[280px] pr-3">
                      <div className="px-2 py-2">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Sports Activities</div>
                        <div className="space-y-1">
                          <SelectItem value="football" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">⚽</span>
                              <div>
                                <div className="font-medium">Football</div>
                                <div className="text-xs text-muted-foreground">Perfect for team matches</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="cricket" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🏏</span>
                              <div>
                                <div className="font-medium">Cricket</div>
                                <div className="text-xs text-muted-foreground">Great for batting practice</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="volleyball" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🏐</span>
                              <div>
                                <div className="font-medium">Volleyball</div>
                                <div className="text-xs text-muted-foreground">Ideal for tournaments</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="others-sport" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🎯</span>
                              <div>
                                <div className="font-medium">Other Sports</div>
                                <div className="text-xs text-muted-foreground">Flexible space for any sport</div>
                              </div>
                            </div>
                          </SelectItem>
                        </div>

                        <SelectSeparator className="my-3" />

                        <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Special Events</div>
                        <div className="space-y-1">
                          <SelectItem value="business-meet" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">💼</span>
                              <div>
                                <div className="font-medium">Business Meeting</div>
                                <div className="text-xs text-muted-foreground">Professional venue</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="birthday" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🎂</span>
                              <div>
                                <div className="font-medium">Birthday Party</div>
                                <div className="text-xs text-muted-foreground">Celebrate in style</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="wedding" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">💒</span>
                              <div>
                                <div className="font-medium">Wedding Reception</div>
                                <div className="text-xs text-muted-foreground">Memorable celebrations</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="others-event" className="cursor-pointer">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🎉</span>
                              <div>
                                <div className="font-medium">Other Events</div>
                                <div className="text-xs text-muted-foreground">Custom event space</div>
                              </div>
                            </div>
                          </SelectItem>
                        </div>
                      </div>
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Event Contact Section */}
              {selectedIsEvent && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 mb-1">Premium Event Booking</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Transform our venue for your special occasion. Get personalized assistance for your event.
                      </p>

                      <a
                        href={`tel:+91${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                      >
                        <Phone className="w-4 h-4" />
                        Call +91 {process.env.NEXT_PUBLIC_PHONE_NUMBER}
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-green-700">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Custom Setup</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Flexible Timing</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Event Planning</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* People Count for Sports */}
              {formValues.sport && !selectedIsEvent && (
                <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="peopleCount" className="text-sm font-medium text-foreground/80 mb-2 block">
                    Number of Players <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formValues.peopleCount?.toString()}
                    onValueChange={(value) => setFormValues(prev => ({ ...prev, peopleCount: parseInt(value) }))}
                  >
                    <SelectTrigger
                      id="peopleCount"
                      aria-label="Number of People"
                      aria-required="true"
                      className={cn(
                        "h-12 rounded-lg text-sm border border-border bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                        getFieldValidationClass("peopleCount")
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select number of players" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {Array.from(
                        { length: getPlayerLimits(formValues.sport).max - 1 },
                        (_, i) => i + 2
                      ).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{num} {num === 1 ? 'player' : 'players'}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Step 3: Date & Time (Only for Sports) */}
            {!selectedIsEvent && (
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    3
                  </div>
                  <h3 className="text-lg font-semibold">Date & Time</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Date Selection */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
                    <Label htmlFor="date" className="text-sm font-medium text-foreground/80 mb-2 block">
                      Select Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          aria-label="Date"
                          aria-required="true"
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal text-sm border border-border bg-background/50 hover:bg-accent/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                            getFieldValidationClass("date")
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formValues.date ? (
                            <span className="font-medium">{format(formValues.date, "PPP")}</span>
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

                  {/* Time Selection */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
                    <Label htmlFor="startTime" className="text-sm font-medium text-foreground/80 mb-2 block">
                      Start Time <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="startTime"
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal text-sm border border-border bg-background/50 hover:bg-accent/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
                            getFieldValidationClass("startTime")
                          )}
                        >
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formValues.time && formValues.time !== "" ? (
                            <span className="font-medium">{formValues.time.replace(/(\d+):(\d+)/, (_, h, m) =>
                              `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
                            )}</span>
                          ) : (
                            <span className="text-muted-foreground">Select time</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <ScrollArea className="h-[300px]">
                          <div className="p-3 grid grid-cols-2 gap-2">
                            {Array.from({ length: 48 }, (_, i) => {
                              const hour = Math.floor(i / 2);
                              const minute = i % 2 === 0 ? "00" : "30";
                              const timeValue = `${hour}:${minute}`;
                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                              const amPm = hour >= 12 ? "PM" : "AM";

                              const isNonOperatingHour = hour >= 2 && hour < 6;
                              const disabled = isNonOperatingHour || !isTimeSlotAvailable(formValues.date, timeValue, 0.5);
                              const isSelected = formValues.time === timeValue;

                              return (
                                <Button
                                  key={timeValue}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "h-9 text-xs font-medium transition-all duration-200",
                                    isSelected && "bg-primary text-primary-foreground border-primary",
                                    !disabled && !isSelected && "hover:bg-primary/10 hover:border-primary/50 hover:text-primary",
                                    disabled && "opacity-40 cursor-not-allowed",
                                    isNonOperatingHour && "bg-destructive/5 border-destructive/20"
                                  )}
                                  onClick={() => {
                                    if (!disabled) setFormValues(prev => ({ ...prev, time: timeValue }));
                                  }}
                                  disabled={disabled}
                                >
                                  {displayHour}:{minute} {amPm}
                                  {isNonOperatingHour && <span className="ml-1 text-destructive">✕</span>}
                                </Button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="duration" className="text-sm font-medium text-foreground/80 mb-2 block">
                    Duration <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-0 bg-background/50 border border-border rounded-lg overflow-hidden">
                    <Button
                      type="button"
                      onClick={decrementDuration}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 rounded-none border-0 hover:bg-muted"
                      disabled={formValues.duration <= 0.5}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 h-12 px-4 flex items-center justify-center bg-background border-x border-border">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          {formValues.duration} {formValues.duration === 1 ? 'hour' : 'hours'}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={incrementDuration}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 rounded-none border-0 hover:bg-muted"
                      disabled={formValues.duration >= 4}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary & Booking (Only for Sports) */}
            {!selectedIsEvent && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    4
                  </div>
                  <h3 className="text-lg font-semibold">Review & Book</h3>
                </div>

                {/* Availability Status */}
                <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                    isAvailable
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  )}>
                    {isAvailable ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">
                        {isAvailable ? "Turf Available" : "Turf Not Available"}
                      </div>
                      <div className="text-sm opacity-80">
                        {isAvailable
                          ? "Ready to book your slot"
                          : "Please select a different time slot"
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                {formValues.date && formValues.time && formValues.duration > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50 animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}>
                    <h4 className="font-semibold mb-3 text-foreground">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{format(formValues.date, "PPP")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {formValues.time.replace(/(\d+):(\d+)/, (_, h, m) =>
                            `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{formValues.duration} {formValues.duration === 1 ? 'hour' : 'hours'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-medium">{formValues.peopleCount} players</span>
                      </div>
                      <div className="border-t border-border/50 pt-2 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Estimated Total:</span>
                          <span className="text-lg font-bold text-primary">₹{estimatedPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Now Button */}
                <div className="animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'backwards' }}>
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      "w-full h-14 text-base font-semibold rounded-lg transition-all duration-300 transform",
                      isAvailable
                        ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-glow hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    disabled={!isAvailable || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {isAvailable ? `Book Now • ₹${estimatedPrice}` : "Select Available Time"}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}