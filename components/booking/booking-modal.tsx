"use client";

import { useState } from "react";
import { X, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  selectedTime: string; // "HH:00"
  onSuccess: () => void;
}

const FACULTIES = [
  "คณะเทคโนโลยีทางทะเล",
  "คณะอัญมณี",
  "คณะวิทยาศาสตร์และศิลปศาสตร์"
];

export function BookingModal({ isOpen, onClose, selectedDate, selectedTime, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    faculty: "",
    studentId: "",
    duration: "1", // string of hours: 1, 2, or 3
  });

  if (!isOpen) return null;

  const startHour = parseInt(selectedTime.split(":")[0]);
  const endHour = startHour + parseInt(formData.duration);
  const endTime = `${endHour.toString().padStart(2, '0')}:00`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          startTime: selectedTime,
          endTime,
          faculty: formData.faculty,
          studentId: formData.studentId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการจอง");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold tracking-tight">ยืนยันการจองห้องซ้อม</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-muted/20">
          <div className="flex items-start gap-4 p-4 bg-primary/10 text-primary-foreground rounded-xl mb-6">
            <Clock className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                {format(selectedDate, "d MMMM yyyy", { locale: th })}
              </p>
              <p className="text-sm text-foreground/80 mt-1">
                เวลา: {selectedTime} - {endTime} น.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">คณะ</label>
              <select 
                required
                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={formData.faculty}
                onChange={e => setFormData({ ...formData, faculty: e.target.value })}
              >
                <option value="" disabled>เลือกคณะของคุณ</option>
                {FACULTIES.map(fac => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">รหัสนิสิต</label>
              <input 
                required
                type="text"
                placeholder="Ex. 66xxxxxx"
                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={formData.studentId}
                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>

            <div className="space-y-2 pb-4">
              <label className="text-sm font-medium">ระยะเวลาที่ต้องการจอง</label>
              <select 
                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              >
                <option value="1">1 ชั่วโมง (ถึง {parseInt(selectedTime) + 1}:00 น.)</option>
                {/* Prevent booking past 21:00 */}
                {parseInt(selectedTime) + 2 <= 21 && (
                  <option value="2">2 ชั่วโมง (ถึง {parseInt(selectedTime) + 2}:00 น.)</option>
                )}
                {parseInt(selectedTime) + 3 <= 21 && (
                  <option value="3">3 ชั่วโมง (ถึง {parseInt(selectedTime) + 3}:00 น.)</option>
                )}
              </select>
              <p className="text-xs text-muted-foreground mt-2">
                * จองได้สูงสุด 3 ชั่วโมงต่อวัน
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border bg-background hover:bg-accent text-sm font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> กำลังจอง...</>
                ) : (
                  'ยืนยันการจอง'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
