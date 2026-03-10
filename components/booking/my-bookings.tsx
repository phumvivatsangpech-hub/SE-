"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { PhotoUpload } from "./photo-upload";
import { AlertCircle } from "lucide-react";

export function MyBookings() {
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    try {
      const res = await fetch("/api/bookings/me");
      if (res.ok) {
        const data = await res.json();
        setMyBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handlePhotoUpload = async (bookingId: string, type: "before" | "after", url: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "before" ? { photoBeforeUrl: url } : { photoAfterUrl: url }
        )
      });
      if (res.ok) {
        fetchMyBookings(); // refresh list
      }
    } catch (err) {
      console.error(err);
      alert("อัปโหลดรูปภาพไม่สำเร็จ");
    }
  };

  if (loading) return <div className="h-40 flex items-center justify-center">กำลังโหลดข้อมูลการจอง...</div>;

  if (myBookings.length === 0) {
    return (
      <div className="bg-muted/10 border border-dashed rounded-2xl p-8 text-center">
        <p className="text-muted-foreground">คุณยังไม่มีประวัติการจองห้องซ้อม</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myBookings.map((booking) => {
        const dateString = format(new Date(booking.date), "EEEE d MMMM yyyy", { locale: th });
        const isCompleted = booking.photoBeforeUrl && booking.photoAfterUrl;
        
        return (
          <div key={booking.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="font-semibold">{dateString}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  เวลา {booking.startTime} - {booking.endTime} น.
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${
                  isCompleted ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                }`}>
                  {isCompleted ? "รายงานครบถ้วน" : "รอการรายงาน"}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  สถานะ {booking.status === "CONFIRMED" ? "ยืนยันแล้ว" : booking.status}
                </span>
              </div>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <PhotoUpload 
                label="รูปภาพก่อนเริ่มใช้งาน"
                existingUrl={booking.photoBeforeUrl}
                onUploadSuccess={(url) => handlePhotoUpload(booking.id, "before", url)}
                disabled={booking.status === "CANCELLED"}
              />
              <PhotoUpload 
                label="รูปภาพหลังใช้งานเสร็จ"
                existingUrl={booking.photoAfterUrl}
                onUploadSuccess={(url) => handlePhotoUpload(booking.id, "after", url)}
                disabled={!booking.photoBeforeUrl || booking.status === "CANCELLED"}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
