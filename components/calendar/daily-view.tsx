"use client";

import { useState } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { th } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock available hours 09:00 - 21:00
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9);

interface Booking {
  id: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  user: {
    email: string;
    name: string | null;
  };
  status: string;
}

interface DailyViewProps {
  bookings: Booking[];
  date: Date;
  setDate: (date: Date) => void;
  onTimeSelect: (time: string) => void;
}

export function DailyView({ bookings, date, setDate, onTimeSelect }: DailyViewProps) {
  const handlePrevDay = () => setDate(subDays(date, 1));
  const handleNextDay = () => setDate(addDays(date, 1));

  // Helper to check if a specific hour block is booked
  const getBookingForHour = (hour: number) => {
    return bookings.find(b => {
      const [startH] = b.startTime.split(":").map(Number);
      const [endH] = b.endTime.split(":").map(Number);
      return hour >= startH && hour < endH; // if 9:00 to 11:00, covers 9 and 10
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-2xl shadow-sm border overflow-hidden">
      {/* Date Header */}
      <div className="flex items-center justify-between p-6 border-b bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {format(date, "EEEEที่ d MMMM yyyy", { locale: th })}
            </h2>
            <p className="text-sm text-muted-foreground">เวลาเปิดทำการ: 09:00 - 21:00 น.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevDay}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setDate(new Date())}
            className="px-3 py-1 text-sm font-medium hover:bg-accent rounded-full transition-colors"
          >
            วันนี้
          </button>
          <button 
            onClick={handleNextDay}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-3">
          {HOURS.map((hour) => {
            if (hour === 21) return null; // 21:00 is closing time, so we just show blocks up to 20:00 - 21:00
            
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const booking = getBookingForHour(hour);
            const isBooked = !!booking;
            const isPast = isSameDay(date, new Date()) && hour <= new Date().getHours() && new Date().getHours() >= 9;

            return (
              <div 
                key={hour} 
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                  isBooked 
                    ? "bg-destructive/10 border-destructive/20" 
                    : isPast 
                      ? "bg-muted/50 border-transparent opacity-60"
                      : "bg-background hover:border-primary/50 hover:shadow-sm cursor-pointer"
                )}
                onClick={() => {
                  if (!isBooked && !isPast) {
                    onTimeSelect(timeString);
                  }
                }}
              >
                <div className="w-20 font-medium text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {timeString}
                </div>
                
                <div className="flex-1">
                  {isBooked ? (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      <span className="font-semibold text-destructive">จองแล้ว</span>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                        โดย {booking.user.name || booking.user.email}
                      </span>
                      <span className="text-xs px-2 py-1 bg-destructive/20 text-destructive rounded-md ml-auto">
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  ) : isPast ? (
                    <span className="text-sm font-medium text-muted-foreground">หมดเวลาแล้ว</span>
                  ) : (
                    <span className="text-sm font-medium text-primary">ว่าง - คลิกเพื่อจอง</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
