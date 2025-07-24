'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { approveBooking, rejectBooking } from '@/lib/admin-actions'
import Footer from '@/components/Footer'

interface Booking {
  id: string
  customerName: string
  sport: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  duration: number
  price: number
  isApproved?: boolean | null
  peopleCount: number
}

interface AdminPanelProps {
  initialBookings: Booking[]
  initialDate?: string
  initialStatus?: string
}

export default function AdminPanel({ initialBookings, initialDate, initialStatus }: AdminPanelProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : new Date()
  )
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus || 'pending')
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [processingBookings, setProcessingBookings] = useState<Set<string>>(new Set())

  // Format sport display name
  const formatSportDisplay = (sport: string): string => {
    return sport.charAt(0).toUpperCase() + sport.slice(1)
  }

  // Handle date filter change
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    // Trigger page refresh with new filters
    const params = new URLSearchParams()
    if (date) {
      params.set('date', format(date, 'yyyy-MM-dd'))
    }
    if (statusFilter !== 'all') {
      params.set('status', statusFilter)
    }
    window.location.href = `/admin?${params.toString()}`
  }

  // Handle status filter change
  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    // Trigger page refresh with new filters
    const params = new URLSearchParams()
    if (selectedDate) {
      params.set('date', format(selectedDate, 'yyyy-MM-dd'))
    }
    if (status !== 'all') {
      params.set('status', status)
    }
    window.location.href = `/admin?${params.toString()}`
  }

  // Handle approve booking
  const handleApprove = async (bookingId: string) => {
    setProcessingBookings(prev => new Set(prev).add(bookingId))
    
    startTransition(async () => {
      try {
        const result = await approveBooking(bookingId)
        
        if (result.success) {
          // Update local state optimistically
          setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, isApproved: true }
              : booking
          ))
          
          toast({
            title: 'Success!',
            description: 'Booking has been approved',
          })
        } else {
          toast({
            title: 'Error approving booking',
            description: result.error,
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error approving booking',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      } finally {
        setProcessingBookings(prev => {
          const newSet = new Set(prev)
          newSet.delete(bookingId)
          return newSet
        })
      }
    })
  }

  // Handle reject booking
  const handleReject = async (bookingId: string) => {
    setProcessingBookings(prev => new Set(prev).add(bookingId))
    
    startTransition(async () => {
      try {
        const result = await rejectBooking(bookingId)
        
        if (result.success) {
          // Update local state optimistically
          setBookings(prev => prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, isApproved: false }
              : booking
          ))
          
          toast({
            title: 'Booking Rejected',
            description: 'Booking has been rejected.',
          })
        } else {
          toast({
            title: 'Error rejecting booking',
            description: result.error,
            variant: 'destructive',
          })
        }
      } catch (error) {
        toast({
          title: 'Error rejecting booking',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      } finally {
        setProcessingBookings(prev => {
          const newSet = new Set(prev)
          newSet.delete(bookingId)
          return newSet
        })
      }
    })
  }

  // Filter and sort bookings
  let filteredBookings = bookings
  if (statusFilter !== 'all') {
    filteredBookings = filteredBookings.filter(b => {
      if (statusFilter === 'pending') return b.isApproved === undefined || b.isApproved === null
      if (statusFilter === 'approved') return b.isApproved === true
      if (statusFilter === 'rejected') return b.isApproved === false
      return true
    })
  }

  // Sort: pending first, then by date/time
  filteredBookings = [...filteredBookings].sort((a, b) => {
    const aPending = a.isApproved === undefined || a.isApproved === null
    const bPending = b.isApproved === undefined || b.isApproved === null
    if (aPending && !bPending) return -1
    if (!aPending && bPending) return 1
    // If both same status, sort by date then time
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })

  return (
    <>
      <main className="container mx-auto px-2 sm:px-4 py-4 flex-grow">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary tracking-tight">
          Admin Panel – Manage Bookings
        </h1>

        {/* Filters UI - sticky on mobile */}
        <div className="sticky top-16 z-20 bg-neutral-50/90 backdrop-blur-md mb-6 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center p-3">
            {/* Date Filter */}
            <div className="w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-[160px] justify-start px-3" size="sm">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {selectedDate ? format(selectedDate, "PPP") : "Filter by Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onSelect={(date) => handleDateChange(date ?? null)}
                    initialFocus
                  />
                  {selectedDate && (
                    <Button 
                      size="sm" 
                      className="mt-2 w-full" 
                      variant="secondary" 
                      onClick={() => handleDateChange(null)}
                    >
                      Clear Date
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[140px] px-3" aria-label="Status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex justify-center py-10">
              <p className="text-neutral-500">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="rounded-xl shadow-md border border-neutral-200 animate-fadeIn">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-lg font-semibold text-primary">
                      Booking #{booking.id}
                    </CardTitle>
                    {booking.isApproved === true ? (
                      <Badge className="bg-green-500 text-white px-3 py-1 rounded-full">
                        Approved
                      </Badge>
                    ) : booking.isApproved === false ? (
                      <Badge className="bg-red-500 text-white px-3 py-1 rounded-full">
                        Rejected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                        Pending
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase">Customer</h3>
                      <p className="text-base font-medium text-neutral-800">{booking.customerName}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase">Sport</h3>
                      <p className="text-base font-medium text-neutral-800">{formatSportDisplay(booking.sport)}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase">Date</h3>
                      <p className="text-base font-medium text-neutral-800">{booking.date}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase">Time</h3>
                      <p className="text-base font-medium text-neutral-800">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase">Amount</h3>
                      <p className="text-base font-medium text-neutral-800">₹{booking.price}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 uppercase">People</h3>
                      <p className="text-base font-medium text-neutral-800">{booking.peopleCount}</p>
                    </div>
                  </div>
                  
                  {/* Show approve/reject buttons only if booking is pending */}
                  {(booking.isApproved === undefined || booking.isApproved === null) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="flex-1 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleApprove(booking.id)}
                        disabled={processingBookings.has(booking.id) || isPending}
                        aria-label="Approve booking"
                      >
                        {processingBookings.has(booking.id) ? "Approving..." : "Approve"}
                      </button>
                      <button
                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleReject(booking.id)}
                        disabled={processingBookings.has(booking.id) || isPending}
                        aria-label="Reject booking"
                      >
                        {processingBookings.has(booking.id) ? "Rejecting..." : "Reject"}
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}