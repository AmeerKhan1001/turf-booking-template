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
    <div className="w-full">
      <Card className="bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-purple-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{turfName}</h2>
              <p className="text-gray-300 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {turfLocation}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Main Booking Form */}
          <form
            className="space-y-8"
            aria-label="Turf Booking Form"
            onSubmit={e => {
              e.preventDefault();
              handleAddToCart();
            }}
          >
            {/* Step 1: Personal Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Personal Information</h3>
                  <p className="text-gray-300 text-sm">Tell us who you are</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="customerName" className="block text-sm font-medium text-gray-200 mb-2">
                    Your Name <span className="text-red-400">*</span>
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
                        "w-full h-12 px-4 rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 transition-all duration-200 shadow-lg hover:bg-white/20",
                        getFieldValidationClass("customerName") && "border-red-400 ring-2 ring-red-400/30"
                      )}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Activity Selection */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Choose Activity</h3>
                  <p className="text-gray-300 text-sm">Select your sport or event type</p>
                </div>
              </div>

              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                <Label htmlFor="sports" className="block text-sm font-medium text-gray-200 mb-2">
                  Activity Type <span className="text-red-400">*</span>
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
                      "h-12 rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm text-white hover:bg-white/20 focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 transition-all duration-200 shadow-lg",
                      getFieldValidationClass("sports") && "border-red-400 ring-2 ring-red-400/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sportDetails.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium text-white">{sportDetails.name}</div>
                        <div className="text-xs text-gray-400">{sportDetails.description}</div>
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
                <div className="mt-6 p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30 animate-fade-in shadow-lg hover:shadow-xl transition-all duration-200" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Sparkles className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold mb-1 text-green-400">Premium Event Booking</h4>
                      <p className="text-sm text-gray-300 mb-4">
                        Transform our venue for your special occasion. Get personalized assistance for your event.
                      </p>

                      <a
                        href={`tel:+91${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Phone className="w-4 h-4" />
                        Call +91 {process.env.NEXT_PUBLIC_PHONE_NUMBER}
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-gray-300">Custom Setup</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-gray-300">Flexible Timing</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="font-medium text-gray-300">Event Planning</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* People Count for Sports */}
              {formValues.sport && !selectedIsEvent && (
                <div className="mt-4 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="peopleCount" className="block text-sm font-medium text-gray-200 mb-2">
                    Number of Players <span className="text-red-400">*</span>
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
                        "h-12 rounded-xl border border-white/30 bg-white/15 backdrop-blur-sm text-white hover:bg-white/20 focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 transition-all duration-200 shadow-lg",
                        getFieldValidationClass("peopleCount") && "border-red-400 ring-2 ring-red-400/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-300" />
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
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Date & Time</h3>
                    <p className="text-gray-300 text-sm">Choose when you want to play</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Date Selection */}
                  <div className="animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
                    <Label htmlFor="date" className="block text-sm font-medium text-gray-200 mb-2">
                      Select Date <span className="text-red-400">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          aria-label="Date"
                          aria-required="true"
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal text-sm border border-white/30 bg-white/15 backdrop-blur-sm text-white hover:bg-white/20 focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 transition-all duration-200 rounded-xl shadow-lg",
                            getFieldValidationClass("date") && "border-red-400 ring-2 ring-red-400/30"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-gray-300" />
                          {formValues.date ? (
                            <span className="font-medium text-white">{format(formValues.date, "PPP")}</span>
                          ) : (
                            <span className="text-gray-400">Pick a date</span>
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
                  <div className="form-field animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
                    <Label htmlFor="startTime" className="block text-sm font-medium text-gray-200 mb-2">
                      Start Time <span className="text-red-400">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="startTime"
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal text-sm border border-white/30 bg-white/15 backdrop-blur-sm text-white hover:bg-white/20 focus:ring-2 focus:ring-blue-400/70 focus:border-blue-400/70 transition-all duration-200 rounded-xl shadow-lg",
                            getFieldValidationClass("startTime") && "border-red-400 ring-2 ring-red-400/30"
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
                <div className="form-field mt-4 animate-fade-in" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="duration" className="form-label">
                    Duration <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-0 bg-white/15 border border-white/30 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm">
                    <Button
                      type="button"
                      onClick={decrementDuration}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 rounded-none border-0 hover:bg-muted-hover focus-ring disabled:opacity-50"
                      disabled={formValues.duration <= 0.5}
                    >
                      <MinusIcon className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 h-12 px-4 flex items-center justify-center bg-white/10 border-x border-white/20">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm text-foreground">
                          {formValues.duration} {formValues.duration === 1 ? 'hour' : 'hours'}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={incrementDuration}
                      variant="ghost"
                      size="sm"
                      className="h-12 w-12 rounded-none border-0 hover:bg-muted-hover focus-ring disabled:opacity-50"
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
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Review & Book</h3>
                    <p className="text-gray-300 text-sm">Confirm your booking details</p>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
                  <div className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border shadow-xs hover-lift transition-all duration-200",
                    isAvailable
                      ? "bg-success-subtle border-success/20 text-success"
                      : "bg-destructive-subtle border-destructive/20 text-destructive"
                  )}>
                    {isAvailable ? (
                      <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-base">
                        {isAvailable ? "Turf Available" : "Turf Not Available"}
                      </div>
                      <div className="text-sm text-foreground-muted">
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
                  <div className="mb-6 p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.9s', animationFillMode: 'backwards' }}>
                    <h4 className="text-lg font-bold text-white mb-4">Booking Summary</h4>
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
                <div className="animate-fade-in pt-4" style={{ animationDelay: '1s', animationFillMode: 'backwards' }}>
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      "w-full h-16 text-lg font-bold rounded-2xl transition-all duration-300 transform",
                      isAvailable
                        ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] border border-white/20"
                        : "bg-white/10 text-gray-400 cursor-not-allowed opacity-60 border border-white/10"
                    )}
                    disabled={!isAvailable || isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Your Booking...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        {isAvailable ? `Add to Cart • ₹${estimatedPrice}` : "Select Available Time"}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
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