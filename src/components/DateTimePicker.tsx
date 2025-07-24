"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DateTimePickerProps {
  date: Date | null
  time: string | null
  onDateSelect: (date: Date | null) => void
  onTimeSelect: (time: string | null) => void
  isTimeSlotAvailable: (date: Date | null, time: string, duration: number) => boolean
  duration: number
}

export default function DateTimePicker({
  date,
  time,
  onDateSelect,
  onTimeSelect,
  isTimeSlotAvailable,
  duration
}: DateTimePickerProps) {
  const today = new Date()

  // Generate time slots from 6:00 AM to 1:30 AM (next day)
  const timeSlots = useMemo(() => {
    const slots = []

    // Generate slots for 6:00 AM to 11:30 PM
    for (let hour = 6; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeValue = `${hour}:${minute.toString().padStart(2, '0')}`
        const isAvailable = isTimeSlotAvailable(date, timeValue, duration)
        const isNonOperatingHour = hour >= 2 && hour < 6
        slots.push({
          time: timeValue,
          available: isAvailable && !isNonOperatingHour
        })
      }
    }

    // Generate slots for 12:00 AM to 1:30 AM (next day)
    for (let hour = 0; hour < 2; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeValue = `${hour}:${minute.toString().padStart(2, '0')}`
        const isAvailable = isTimeSlotAvailable(date, timeValue, duration)
        const isNonOperatingHour = hour >= 2 && hour < 6
        slots.push({
          time: timeValue,
          available: isAvailable && !isNonOperatingHour
        })
      }
    }

    return slots
  }, [date, duration, isTimeSlotAvailable])

  // Convert 24-hour time to 12-hour format for display
  const formatTimeDisplay = (timeValue: string) => {
    const [hour, minute] = timeValue.split(':').map(Number)
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const amPm = hour >= 12 ? 'PM' : 'AM'
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${amPm}`
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="flex max-sm:flex-col">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(newDate) => {
              if (newDate) {
                onDateSelect(newDate)
                onTimeSelect(null)
              }
            }}
            className="p-2 sm:pe-5"
            disabled={(date) => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const compareDate = new Date(date)
              compareDate.setHours(0, 0, 0, 0)
              return compareDate < today
            }}
          />
          <div className="relative w-full max-sm:h-48 sm:w-40">
            <div className="absolute inset-0 py-4 max-sm:border-t">
              <ScrollArea className="h-full sm:border-s">
                <div className="space-y-3">
                  <div className="flex h-5 shrink-0 items-center px-5">
                    <p className="text-sm font-medium">
                      {date ? format(date, "EEEE, d") : "Select date"}
                    </p>
                  </div>
                  <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                    {timeSlots.map(({ time: timeSlot, available }) => (
                      <Button
                        key={timeSlot}
                        variant={time === timeSlot ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => onTimeSelect(timeSlot)}
                        disabled={!available}
                      >
                        {formatTimeDisplay(timeSlot)}
                      </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Legend */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-neutral-200">
        <h4 className="text-sm font-semibold text-neutral-700 mb-3">Pricing Information (Per Hour)</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Weekday Day (6AM-6PM):</span>
              <span className="font-semibold text-green-600">₹{Number(process.env.NEXT_PUBLIC_WEEKDAY_DAY_RATE) || 600}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Weekday Night (6PM-6AM):</span>
              <span className="font-semibold text-blue-600">₹{Number(process.env.NEXT_PUBLIC_WEEKDAY_NIGHT_RATE) || 1000}/hr</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Weekend Day (6AM-6PM):</span>
              <span className="font-semibold text-green-600">₹{Number(process.env.NEXT_PUBLIC_WEEKEND_DAY_RATE) || 600}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Weekend Night (6PM-6AM):</span>
              <span className="font-semibold text-blue-600">₹{Number(process.env.NEXT_PUBLIC_WEEKEND_NIGHT_RATE) || 1100}/hr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}