"use client";

import { useState } from "react";
import { Send, Loader2, Image as ImageIcon } from "lucide-react";
import { PhotoUpload } from "@/components/booking/photo-upload";

interface CreatePostProps {
  onSuccess: () => void;
  userImage?: string;
}

export function CreatePost({ onSuccess, userImage }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content,
          mediaUrl: photoUrl,
          mediaType: photoUrl ? "IMAGE" : null
        })
      });

      if (res.ok) {
        setContent("");
        setPhotoUrl(null);
        setShowPhotoUpload(false);
        onSuccess();
      } else {
        alert("แชร์โพสต์ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border p-4 sm:p-5">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <img 
             src={userImage || `https://api.dicebear.com/7.x/initials/svg?seed=User`} 
             alt="Avatar" 
             className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-primary/20 bg-muted shrink-0"
          />
          <div className="w-full">
            <textarea
              placeholder="พูดคุยเรื่องดนตรี หาสมาชิก หรือแชร์ผลงานของคุณที่นี่..."
              className="w-full bg-transparent resize-none outline-none text-foreground placeholder-muted-foreground pt-3 sm:pt-4 min-h-[80px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {showPhotoUpload && (
               <div className="mt-2 mb-4">
                 <PhotoUpload 
                   label="แนบรูปภาพ (ทางเลือก)"
                   existingUrl={photoUrl}
                   onUploadSuccess={(url) => setPhotoUrl(url)}
                   disabled={loading}
                 />
               </div>
            )}

            <div className="flex justify-between items-center mt-2 border-t pt-3">
              <button
                type="button"
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                disabled={loading}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full shadow hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                โพสต์
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
