'use client';

import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { calculateBookingPrice, formatTimeForDisplay, normalizeTime } from "@/lib/timeUtils";
import { processCartAction, removeFromCartAction, type ActionResult } from "@/lib/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, X, Clock, Users, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id?: number;
  customerName: string;
  sport: string;
  peopleCount: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  courtId: number;
  courtName: string;
  price: number;
}

interface CartProps { }

export default function Cart({ }: CartProps) {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load cart items from localStorage on mount
  useEffect(() => {
    const loadCartItems = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const normalizedItems = items.map((item: CartItem) => ({
        ...item,
        startTime: normalizeTime(item.startTime),
        endTime: normalizeTime(item.endTime)
      }));
      setCartItems(normalizedItems);
    };

    loadCartItems();
  }, []);

  // Listen for cart visibility changes
  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(!localStorage.getItem("hideCart"));
    };

    updateVisibility();
    window.addEventListener("cart-visibility-changed", updateVisibility);
    window.addEventListener("storage", updateVisibility);

    return () => {
      window.removeEventListener("cart-visibility-changed", updateVisibility);
      window.removeEventListener("storage", updateVisibility);
    };
  }, []);

  // Listen for localStorage changes (cross-tab and same tab via custom event)
  useEffect(() => {
    const syncCart = () => {
      const items = JSON.parse(localStorage.getItem("cartItems") || "[]");
      const normalizedItems = items.map((item: CartItem) => ({
        ...item,
        startTime: normalizeTime(item.startTime),
        endTime: normalizeTime(item.endTime)
      }));
      setCartItems(normalizedItems);
    };

    window.addEventListener("storage", syncCart);
    window.addEventListener("cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cart-updated", syncCart);
    };
  }, []);

  // Remove from cart (local only) with animation
  const handleRemoveFromCart = async (index: number) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    window.dispatchEvent(new Event("cart-updated"));
    toast({
      title: "Item removed",
      description: "Item removed from cart"
    });
  };

  // Format display name for the sport
  const formatSportDisplay = (sport: string): string => {
    return sport.charAt(0).toUpperCase() + sport.slice(1);
  };

  // Helper: format date as 'May 25'
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Helper: format time as '11:00 PM' or '23:00' based on locale
  const formatTime = (timeStr: string) => {
    return formatTimeForDisplay(timeStr);
  };

  // Helper: format booking range with midnight transition
  const formatBookingRange = (item: CartItem) => {
    const [startHour, startMinute] = item.startTime.split(":").map(Number);
    const totalMinutes = item.duration * 60;

    // Calculate minutes until midnight from start time
    const minutesToMidnight = (24 * 60) - (startHour * 60 + startMinute);

    // If duration exceeds minutes until midnight, booking crosses to next day
    if (totalMinutes > minutesToMidnight) {
      const startDate = item.date;
      const nextDay = new Date(item.date);
      nextDay.setDate(nextDay.getDate() + 1);
      const endDate = nextDay.toISOString().split('T')[0];

      // Format times for display
      const remainingMinutes = totalMinutes - minutesToMidnight;
      const endHour = Math.floor(remainingMinutes / 60);
      const endMinute = remainingMinutes % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      return {
        isMultiDay: true,
        day1: {
          date: formatDate(startDate),
          time: `${formatTime(item.startTime)} - 12:00 AM`
        },
        day2: {
          date: formatDate(endDate),
          time: `12:00 AM - ${formatTime(endTime)}`
        }
      };
    } else {
      return {
        isMultiDay: false,
        day1: {
          date: formatDate(item.date),
          time: `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
        }
      };
    }
  };

  // Calculate totals    
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const serviceFee = Number(process.env.NEXT_PUBLIC_SERVICE_FEE) || 0;
    const total = subtotal + serviceFee;

    return { subtotal, serviceFee, total };
  };

  const { subtotal, serviceFee, total } = calculateTotals();

  // Generate UPI payment link
  const generateUPILink = (item: CartItem): string => {
    const upiId = process.env.NEXT_PUBLIC_UPI_ID || "example@upi";
    const transactionNote = `${Date.now()} - ${item.customerName} - ${item.sport} - ${item.peopleCount} people`;

    const params = new URLSearchParams({
      pa: upiId,
      am: total.toFixed(2),
      tn: transactionNote,
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  };

  // Handle UPI payment
  const handleUPIPayment = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsProcessing(true);

      // Check for conflicts first
      const formData = new FormData();
      formData.append('action', 'check-conflicts');
      formData.append('cartItems', JSON.stringify(cartItems));

      const conflictResult = await processCartAction(formData);

      if (!conflictResult.success) {
        // Clear cart on conflict
        setCartItems([]);
        localStorage.removeItem("cartItems");
        window.dispatchEvent(new Event("cart-updated"));

        toast({
          title: "Booking Conflict",
          description: "Someone else booked a conflicting slot recently. Please select a different time.",
          variant: "destructive"
        });
        return;
      }

      // Generate UPI link and redirect
      const timestamp = Date.now();
      localStorage.setItem("lastPaymentId", timestamp.toString());

      const totalItem = {
        ...cartItems[0],
        id: timestamp,
        price: total,
        customerName: cartItems[0].customerName,
        peopleCount: cartItems.reduce((sum, item) => sum + item.peopleCount, 0)
      };

      window.location.href = generateUPILink(totalItem);

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reservation (pay later)
  const handleReservation = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('action', 'reserve');
      formData.append('cartItems', JSON.stringify(cartItems));

      const result = await processCartAction(formData);

      if (result.success) {
        // Clear cart
        setCartItems([]);
        localStorage.removeItem("cartItems");
        localStorage.removeItem("lastPaymentId");
        window.dispatchEvent(new Event("cart-updated"));

        setShowSuccess(true);
        toast({
          title: "Reservation Successful!",
          description: "Your booking has been reserved. Please pay at the turf.",
        });

        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        toast({
          title: "Error processing reservation",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process reservation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="relative w-full max-w-lg mx-auto my-8 md:my-10 lg:my-12">
      <Card className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full">
        <CardContent className="p-6 flex flex-col h-full space-y-6 w-full">
          {/* Cart Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-primary" />
                {cartItems.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItems.length}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-primary tracking-tight">Your Cart</h2>
            </div>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => {
                  setCartItems([]);
                  localStorage.removeItem("cartItems");
                  window.dispatchEvent(new Event("cart-updated"));
                }}
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          {cartItems.length === 0 ? (
            // Empty Cart State
            <div className="flex flex-col items-center justify-center py-10 flex-grow">
              <ShoppingCart className="w-24 h-24 text-neutral-300 mb-4" />
              <p className="text-neutral-500 text-lg text-center">Cart Is Empty</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-grow space-y-4">
                {cartItems.map((item, index) => {
                  const bookingRange = formatBookingRange(item);
                  return (
                    <div
                      key={`${item.date}-${item.startTime}-${index}`}
                      className="space-y-3"
                    >
                      {/* Sport Name */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-primary">
                          {formatSportDisplay(item.sport)}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-400 hover:text-red-500 transition-colors"
                          onClick={() => handleRemoveFromCart(index)}
                          aria-label="Remove from cart"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <div>
                          <div className="font-medium">
                            {bookingRange.day1.date}
                          </div>
                          <div className="text-sm">
                            {bookingRange.isMultiDay && bookingRange.day2 ? (
                              <>
                                {bookingRange.day1.time}
                                <br />
                                {bookingRange.day2.time} ({bookingRange.day2.date})
                              </>
                            ) : (
                              bookingRange.day1.time
                            )}
                          </div>
                        </div>
                      </div>

                      {/* People Count and Price */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{item.peopleCount} people</span>
                        <span className="mx-2">•</span>
                        <span className="font-bold text-primary text-lg">₹{item.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-neutral-200 pt-4 mt-4 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-base">
                    <span className="text-neutral-600">Service Fee</span>
                    <span className="font-semibold">₹{serviceFee}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-xl pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>

                {/* Single Payment Button */}
                <div className="pt-4">
                  <Button
                    className="w-full h-14 text-lg font-bold rounded-xl bg-primary text-white shadow-lg hover:bg-primary/90 transition-all"
                    disabled={cartItems.length === 0 || isProcessing}
                    onClick={handleUPIPayment}
                  >
                    {isProcessing ? "Processing..." : `Pay ₹${total} with GPay`}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full">
            <svg className="w-16 h-16 text-green-500 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl font-bold mb-2 text-green-700">Reservation Successful!</h3>
            <p className="text-neutral-700 text-center mb-2">Your booking has been reserved.<br />Please pay at the turf.</p>
          </div>
        </div>
      )}
    </div>
  );
}