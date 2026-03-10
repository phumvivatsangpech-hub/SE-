"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ComplaintModal } from "@/components/complaints/complaint-form";

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING":
        return <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-semibold">รอดำเนินการ</span>;
      case "IN_PROGRESS":
        return <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">กำลังตรวจสอบ</span>;
      case "RESOLVED":
        return <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">แก้ไขแล้ว</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แจ้งปัญหา/ร้องเรียน</h1>
          <p className="text-muted-foreground mt-2">
            ติดตามสถานะและรายงานปัญหาอุปกรณ์ในห้องซ้อม
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          แจ้งปัญหาใหม่
        </button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-muted/10 border border-dashed rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-1">ยังไม่มีการแจ้งปัญหา</h3>
          <p className="text-muted-foreground">หากพบอุปกรณ์ชำรุด สามารถกดแจ้งปัญหาได้เลย</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="bg-card border shadow-sm rounded-2xl p-5 flex flex-col transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(complaint.status)}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(complaint.createdAt), "d MMM yyyy", { locale: th })}
                </span>
              </div>
              <h3 className="font-semibold text-lg line-clamp-1">{complaint.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3 flex-1">
                {complaint.content}
              </p>
              
              {complaint.photoUrl && (
                <div className="mt-4 w-full h-32 rounded-lg overflow-hidden border">
                  <img src={complaint.photoUrl} alt="Issue" className="w-full h-full object-cover" />
                </div>
              )}
              
              {complaint.adminNote && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border text-sm">
                  <span className="font-semibold text-primary block mb-1">Admin:</span>
                  <span className="text-muted-foreground">{complaint.adminNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ComplaintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchComplaints();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
