"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { DailyView } from "@/components/calendar/daily-view";
import { BookingModal } from "@/components/booking/booking-modal";
import { MyBookings } from "@/components/booking/my-bookings";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState([]);
  
  const [activeTab, setActiveTab] = useState<"calendar" | "my-bookings">("calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/bookings?date=${date.toISOString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && activeTab === "calendar") {
      fetchBookings();
    }
  }, [date, status, activeTab]);

  if (status === "loading") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จองห้องซ้อมดนตรี</h1>
          <p className="text-muted-foreground mt-2">
            จองเวลาใช้งานห้องซ้อมด้วยตัวเอง จำกัด 3 ชั่วโมง/วัน
          </p>
        </div>

        <div className="flex p-1 bg-muted/30 border rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("calendar")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "calendar" ? "bg-background shadow-sm border text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            หน้าปฏิทิน
          </button>
          <button
            onClick={() => setActiveTab("my-bookings")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              activeTab === "my-bookings" ? "bg-background shadow-sm border text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            ประวัติการจองของฉัน
          </button>
        </div>
      </div>

      {activeTab === "calendar" ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <DailyView 
            bookings={bookings} 
            date={date} 
            setDate={setDate} 
            onTimeSelect={(time) => {
              setSelectedTime(time);
              setIsModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <MyBookings />
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={date}
        selectedTime={selectedTime}
        onSuccess={() => {
          alert("จองห้องซ้อมสำเร็จ!");
          fetchBookings();
        }}
      />
    </div>
  );
}
