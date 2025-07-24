'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function approveBooking(bookingId: string) {
  try {
    // Check if user is admin
    await requireAdmin()
    
    const id = parseInt(bookingId)
    if (isNaN(id)) {
      return { success: false, error: 'Invalid booking ID' }
    }

    // Check if booking exists
    const booking = await storage.getBookingById(id)
    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Approve the booking
    const success = await storage.approveBooking(id)
    if (!success) {
      return { success: false, error: 'Could not approve booking' }
    }

    // Revalidate the admin page to show updated data
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('Error approving booking:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return { success: false, error: 'Admin access required' }
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return { success: false, error: 'Authentication required' }
    }
    return { success: false, error: 'Failed to approve booking' }
  }
}

export async function rejectBooking(bookingId: string) {
  try {
    // Check if user is admin
    await requireAdmin()
    
    const id = parseInt(bookingId)
    if (isNaN(id)) {
      return { success: false, error: 'Invalid booking ID' }
    }

    // Check if booking exists
    const booking = await storage.getBookingById(id)
    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    // Reject the booking
    const success = await storage.rejectBooking(id)
    if (!success) {
      return { success: false, error: 'Could not reject booking' }
    }

    // Revalidate the admin page to show updated data
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error) {
    console.error('Error rejecting booking:', error)
    if (error instanceof Error && error.message === 'Admin access required') {
      return { success: false, error: 'Admin access required' }
    }
    if (error instanceof Error && error.message === 'Authentication required') {
      return { success: false, error: 'Authentication required' }
    }
    return { success: false, error: 'Failed to reject booking' }
  }
}