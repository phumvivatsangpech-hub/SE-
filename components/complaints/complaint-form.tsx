"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PhotoUpload } from "@/components/booking/photo-upload";

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ComplaintModal({ isOpen, onClose, onSuccess }: ComplaintModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    photoUrl: "" as string | null,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
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
      <div className="w-full max-w-lg bg-background rounded-2xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold tracking-tight">แจ้งปัญหาอุปกรณ์ / ห้องซ้อม</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-muted/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">หัวข้อปัญหา <span className="text-destructive">*</span></label>
              <input 
                required
                type="text"
                placeholder="เช่น สายกีตาร์ขาด / แอร์ไม่เย็น"
                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">รายละเอียดเพิ่มเติม <span className="text-destructive">*</span></label>
              <textarea 
                required
                rows={4}
                placeholder="อธิบายปัญหาที่พบเจออย่างละเอียด..."
                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <PhotoUpload 
                label="รูปภาพประกอบ (ไม่บังคับ ทางเลือกเสริม)"
                existingUrl={formData.photoUrl}
                onUploadSuccess={(url) => setFormData({ ...formData, photoUrl: url })}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border bg-background hover:bg-accent text-sm font-medium transition-colors"
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> กำลังส่งข้อมูล...</>
                ) : (
                  'ส่งเรื่องร้องเรียน'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
