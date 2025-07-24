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
    <div className="relative w-full">
      <div className="space-y-6">
        {cartItems.length === 0 ? (
          // Empty Cart State - Dark Theme
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/10">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 text-sm max-w-xs">Add a booking to get started with your sports adventure</p>
          </div>
        ) : (
          <>
            {/* Cart Items - Dark Theme */}
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const bookingRange = formatBookingRange(item);
                return (
                  <div
                    key={`${item.date}-${item.startTime}-${index}`}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
                  >
                    {/* Sport Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-white/10">
                          <span className="text-2xl">
                            {item.sport === 'football' ? '⚽' : 
                             item.sport === 'cricket' ? '🏏' : 
                             item.sport === 'volleyball' ? '🏐' : '🎯'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {formatSportDisplay(item.sport)}
                          </h3>
                          <p className="text-gray-400 text-sm">{item.courtName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 rounded-xl border border-white/10"
                        onClick={() => handleRemoveFromCart(index)}
                        aria-label="Remove from cart"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Booking Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Date and Time */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-blue-400/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-3 h-3 text-blue-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Schedule</span>
                        </div>
                        <div className="text-white font-medium text-sm">
                          {bookingRange.day1.date}
                        </div>
                        <div className="text-gray-400 text-xs">
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

                      {/* People Count */}
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-green-400/20 rounded-lg flex items-center justify-center">
                            <Users className="w-3 h-3 text-green-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Players</span>
                        </div>
                        <div className="text-white font-medium text-sm">
                          {item.peopleCount} {item.peopleCount === 1 ? 'person' : 'people'}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {item.duration}h duration
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-gray-300 text-sm">Booking Price</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                          ₹{item.price}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary - Dark Theme */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">₹{subtotal}</span>
                </div>
                {serviceFee > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Service Fee</span>
                    <span className="font-medium text-white">₹{serviceFee}</span>
                  </div>
                )}
                
                <div className="flex justify-between font-bold text-xl pt-4 border-t border-white/20">
                  <span className="text-white">Total</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">₹{total}</span>
                </div>

                {/* Payment Button */}
                <div className="pt-4">
                  <Button
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={cartItems.length === 0 || isProcessing}
                    onClick={handleUPIPayment}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        Pay ₹{total} with GPay
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Clear Cart Button */}
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 flex items-center justify-center gap-2 rounded-xl py-3 transition-all duration-200 border border-white/10"
                    onClick={() => {
                      setCartItems([]);
                      localStorage.removeItem("cartItems");
                      window.dispatchEvent(new Event("cart-updated"));
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cart
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Success Modal - Dark Theme */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Booking Confirmed!</h3>
            <p className="text-gray-600 text-center leading-relaxed">Your reservation has been successfully created. Please pay at the turf to complete your booking.</p>
          </div>
        </div>
      )}
    </div>
  );
}